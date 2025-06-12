"use strict";
// src/middlewares/contextMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = contextMiddleware;
const crypto_1 = require("crypto");
const requestContext_1 = require("../context/requestContext");
function contextMiddleware(req, res, next) {
    var _a, _b;
    // Extract user_id from the request, assuming authMiddleware has already run
    // The 'user' object on 'req' is a common pattern after authentication.
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    // Create a context for this request
    const store = {
        correlationId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) ||
            req.headers["x-correlation-id"] ||
            (0, crypto_1.randomUUID)(),
        userId: userId,
    };
    // Run the rest of the request chain in the context of this store
    requestContext_1.requestContext.run(store, () => {
        next();
    });
}
