"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRole = exports.validateUserParams = void 0;
const expressValidator = require("express-validator");
const { param } = expressValidator;
exports.validateUserParams = [
    param("role").custom((value) => {
        const allowedRoles = [
            "DRM",
            "ARM",
            "HOD",
            "ED",
            "NETOPS",
            "WEBMASTER",
            "HODHPC",
        ];
        if (!allowedRoles.includes(value.toUpperCase())) {
            throw new Error("Invalid role specified.");
        }
        return true;
    }),
    param("empNo")
        .isString()
        .matches(/^\d+$/)
        .withMessage("Employee number must be a numeric string representing a bigint."),
];
exports.validateUserRole = param("role").custom((value) => {
    const allowedRoles = [
        "DRM",
        "ARM",
        "HOD",
        "ED",
        "NETOPS",
        "WEBMASTER",
        "HODHPC",
    ];
    if (!allowedRoles.includes(value.toUpperCase())) {
        throw new Error("Invalid role specified.");
    }
    return true;
});
