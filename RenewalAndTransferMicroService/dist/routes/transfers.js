"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transferController_1 = require("../controllers/transferController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// @desc Get all transfers for a user(DRM, HOD)
// @route GET /api/transfers/all
// @access private
router.get("/all", authMiddleware_1.protect, transferController_1.getTransfers);
router.get("/all/:role/:id", transferController_1.getTransfersByRoleAndId);
// @desc Get a transfers for a user(DRM, HOD)
// @route GET /api/transfers/:trnsfrID
// @access private
router.get("/:trnsfrId", authMiddleware_1.protect, transferController_1.getTransfer);
// @desc Create a transfer
// @route /api/transfers/create
// @access private
router.post("/create", authMiddleware_1.protect, transferController_1.createTransfer);
// @desc Approve a transfer
// @route /api/transfers/:trnsfrID/approve
// @access private
router.put("/:trnsfrId/approve", authMiddleware_1.protect, transferController_1.approveTransfer);
exports.default = router;
