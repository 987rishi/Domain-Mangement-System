"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 500;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
