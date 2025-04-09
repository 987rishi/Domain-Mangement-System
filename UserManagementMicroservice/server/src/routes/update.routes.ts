import {Router} from "express";
import { updateController } from "../controllers/updateController.controller";
const router = Router();
// PATCH: /api/update/users/:empNo
router.patch("/:empNo", updateController);
export default router;