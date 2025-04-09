import { Router } from "express";
import {
  approveVaptRenewal,
  createVaptRenewal,
  getVaptRenewal,
  getVaptRenewals,
  rejectVaptRenewal,
  reviewVaptRenewal,
} from "../controllers/vaptRenewalController";

const router = Router();

router.post("/create", createVaptRenewal);

router.patch("/:vaptRnwlId/approve", approveVaptRenewal);

router.patch("/:vaptRnwlId/reject", rejectVaptRenewal);

router.patch("/:vaptRnwlId/review", reviewVaptRenewal);

router.get("/all", getVaptRenewals);

router.get("/:vaptRnwlId", getVaptRenewal);
export default router;
