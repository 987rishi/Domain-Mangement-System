import { Router } from "express";
import {
  createIpRenewal,
  approveIpRenewal,
  rejectIpRenewal,
  reviewIpRenewal,
  completeIpRenewal,
  getIpRenewals,
  getIpRenewal,
} from "../controllers/ipRenewalController";
import { getVaptRenewal } from "../controllers/vaptRenewalController";

const router = Router();

router.post("/create", createIpRenewal);

router.patch("/:ipRnwlId/approve", approveIpRenewal);

router.patch("/:ipRnwlId/reject", rejectIpRenewal);

router.patch("/:ipRnwlId/review", reviewIpRenewal);

router.patch("/:ipRnwlId/complete", completeIpRenewal);

router.get("/all", getIpRenewals);

router.get("/:ipRnwlId", getIpRenewal);

export default router;
