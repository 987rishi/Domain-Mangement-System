import {Router} from "express";
import { assignmentSchemaValidation } from "../middleware/schemaValidation";
import { assignmentController } from "../controllers/assigmentController.controller";
const router = Router();

// POST: /api/projects/assignment
router.post("/assignment",
    // authMiddleware,
    // assignmentSchemaValidation
    assignmentController);

export default router;