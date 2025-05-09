"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = void 0;
const formatError = (error) => {
    var _a;
    let errors = {};
    (_a = error.errors) === null || _a === void 0 ? void 0 : _a.map((issue) => {
        var _a;
        errors[(_a = issue.path) === null || _a === void 0 ? void 0 : _a[0]] = issue.message;
    });
    return errors;
};
exports.formatError = formatError;
