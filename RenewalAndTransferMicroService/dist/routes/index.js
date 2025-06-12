"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfers_1 = __importDefault(require("./transfers"));
const ipRenewals_1 = __importDefault(require("./ipRenewals"));
const vaptRenewals_1 = __importDefault(require("./vaptRenewals"));
const router = (0, express_1.Router)();
// @desc Route for transfer
// @access private
router.use("/transfers", transfers_1.default);
// @desc Route for ip renewals
// @access private
router.use("/renewals/ip/", ipRenewals_1.default);
// @desc Route for ip renewals
// @access private
router.use("/renewals/vapt/", vaptRenewals_1.default);
exports.default = router;
