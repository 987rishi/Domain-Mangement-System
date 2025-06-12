"use strict";
// src/logging/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const requestContext_1 = require("../context/requestContext");
const httpTransport_1 = require("./httpTransport");
// Your DTO defines these levels
const customLevels = {
    levels: {
        FATAL: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        TRACE: 5,
    },
    colors: {
        FATAL: "bold red",
        ERROR: "red",
        WARN: "yellow",
        INFO: "green",
        DEBUG: "blue",
        TRACE: "gray",
    },
};
winston_1.default.addColors(customLevels.colors);
// This format function transforms the log object to match your DTO
const dtoFormat = winston_1.format.printf((_a) => {
    var { level, message, timestamp } = _a, metadata = __rest(_a, ["level", "message", "timestamp"]);
    const context = requestContext_1.requestContext.getStore();
    const logEntry = {
        timestamp: timestamp || new Date().toISOString(),
        level: level.toUpperCase(),
        service_name: process.env.SERVICE_NAME || "RenewalAndTransferMicroservice",
        instance_id: process.env.INSTANCE_ID || "unknown",
        correlation_id: context === null || context === void 0 ? void 0 : context.correlationId,
        user_id: context === null || context === void 0 ? void 0 : context.userId,
        message: message,
        details: metadata,
    };
    return JSON.stringify(logEntry);
});
const logger = winston_1.default.createLogger({
    level: "TRACE", // Log everything from TRACE and up
    levels: customLevels.levels,
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.splat(), // Handles string interpolation like logger.info('user %s', userId)
    winston_1.format.metadata({ fillExcept: ["message", "level", "timestamp"] }), dtoFormat),
    transports: [
        // Transport for sending logs to the central logging service
        new httpTransport_1.HttpTransport({
            url: "http://localhost:5001/api/v1/logs",
            level: "INFO", // Send INFO and higher to the remote service
        }),
    ],
    // Do not exit on handled exceptions
    exitOnError: false,
});
// For local development, it's useful to see logs in the console
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf((info) => {
            const { timestamp, level, message, metadata } = info;
            const context = requestContext_1.requestContext.getStore();
            const details = Object.keys(metadata).length
                ? JSON.stringify(metadata)
                : "";
            return `[${timestamp}] [${(context === null || context === void 0 ? void 0 : context.correlationId) || "NO-CORR-ID"}] ${level}: ${message} ${details}`;
        })),
    }));
}
exports.default = logger;
