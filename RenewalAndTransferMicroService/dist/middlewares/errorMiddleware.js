"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode ? err.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        error: err,
        // stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
    return next();
};
exports.default = errorHandler;
