import { Router } from "express";
import {
  getTransfers,
  createTransfer,
  approveTransfer,
  getTransfer,
  getTransfersByRoleAndId,
} from "../controllers/transferController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// @desc Get all transfers for a user(DRM, HOD)
// @route GET /api/transfers/all
// @access private
router.get("/all", protect, getTransfers);

router.get("/all/:role/:id", getTransfersByRoleAndId);

// @desc Get a transfers for a user(DRM, HOD)
// @route GET /api/transfers/:trnsfrID
// @access private
router.get("/:trnsfrId", protect, getTransfer);

// @desc Create a transfer
// @route /api/transfers/create
// @access private
router.post("/create", protect, createTransfer);

// @desc Approve a transfer
// @route /api/transfers/:trnsfrID/approve
// @access private
router.put("/:trnsfrId/approve", protect, approveTransfer);

export default router;
