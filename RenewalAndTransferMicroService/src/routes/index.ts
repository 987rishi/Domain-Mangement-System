import { Router } from "express";
import transferRoute from "./transfers";
import ipRenewalRoute from "./ipRenewals";
import vaptRenewalRoute from "./vaptRenewals";
import { protect } from "../middlewares/authMiddleware";
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

const router = Router();

// @desc Route for transfer
// @access private
router.use("/transfers", transferRoute);

// @desc Route for ip renewals
// @access private
router.use("/renewals/ip/", ipRenewalRoute);

// @desc Route for ip renewals
// @access private
router.use("/renewals/vapt/", vaptRenewalRoute);

export default router;
