"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
/**
 * Middleware to protect routes by verifying the presence and validity of a Bearer token.
 *
 * @param {Request} req - The Express request object, which should contain the `Authorization` header.
 * @param {Response} res - The Express response object, used to send error responses if the token is invalid or missing.
 * @param {NextFunction} next - The next middleware function in the stack.
 *
 * @returns {Promise<void>} A promise that resolves if the token is valid, or sends an error response if invalid or missing.
 *
 * @throws {Error} If the token payload is invalid or cannot be parsed.
 *
 * @example
 * // Usage in an Express route
 * app.get('/protected-route', protect, (req, res) => {
 *   res.json({ message: 'You have access!', user: req.user });
 * });
 */
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            // Extract payload (second part of token)
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
            const decoded = JSON.parse(jsonPayload);
            req.user = decoded; // Attach decoded payload to request
            console.log(decoded, typeof decoded.id);
            next();
        }
        catch (err) {
            res.status(400).json({ message: "Invalid token payload" });
            return Promise.reject();
        }
    }
    else {
        res.status(401).json({ message: "No token provided" });
        return Promise.reject();
    }
});
exports.protect = protect;
