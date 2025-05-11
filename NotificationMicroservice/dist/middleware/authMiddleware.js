"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized User" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const payload = jsonwebtoken_1.default.decode(token);
    console.log(token);
    console.log(payload);
    if (!payload) {
        res.status(400).json({ message: "Invalid token payload" });
        return;
    }
    req.user = payload;
    next();
};
exports.authMiddleware = authMiddleware;
