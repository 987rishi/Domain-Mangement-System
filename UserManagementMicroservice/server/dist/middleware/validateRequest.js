"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validationResult = require("express-validator"); // The core function from express-validator
const validateRequest = (req, res, next) => {
    // 1. Get validation results for this request
    const errors = validationResult(req);
    // 2. Check if there are any validation errors
    if (!errors.isEmpty()) {
        // 3a. If errors exist, send a 400 response with error details
        res.status(400).json({ errors: errors.array() });
        return;
    }
    // 3b. If no errors, pass control to the next middleware/handler
    next();
};
exports.validateRequest = validateRequest;
