import { Router } from "express";
import {
  getTransfers,
  createTransfer,
  approveTransfer,
  getTransfer,
} from "../controllers/transferController";

const router = Router();

// @desc Get all transfers for a user(DRM, HOD)
// @route GET /api/transfers/all
// @access private
router.get("/all", getTransfers);

// @desc Get a transfers for a user(DRM, HOD)
// @route GET /api/transfers/:trnsfrID
// @access private
router.get("/:trnsfrId", getTransfer);

// @desc Create a transfer
// @route /api/transfers/create
// @access private
router.post("/create", createTransfer);

// @desc Approve a transfer
// @route /api/transfers/:trnsfrID/approve
// @access private
router.put("/:trnsfrId/approve", approveTransfer);

export default router;
