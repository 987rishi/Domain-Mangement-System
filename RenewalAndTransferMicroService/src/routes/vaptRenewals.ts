import { Router } from "express";
import {
  approveVaptRenewal,
  createVaptRenewal,
  getVaptRenewal,
  getVaptRenewals,
  getVaptRenewalsParamsVersion,
  rejectVaptRenewal,
  reviewVaptRenewal,
} from "../controllers/vaptRenewalController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", protect, createVaptRenewal);

router.patch("/:vaptRnwlId/approve", protect, approveVaptRenewal);

router.patch("/:vaptRnwlId/reject", protect, rejectVaptRenewal);

router.patch("/:vaptRnwlId/review", protect, reviewVaptRenewal);

router.get("/all", protect, getVaptRenewals);

router.get("/all/:role/:id", getVaptRenewalsParamsVersion);

router.get("/:vaptRnwlId", protect, getVaptRenewal);

export default router;
