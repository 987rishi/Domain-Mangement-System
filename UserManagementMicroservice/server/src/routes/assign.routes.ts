import {Router} from "express";
import { assignmentController } from "../controllers/assigmentController.controller";
import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();
/**
 * POST: /api/projects/assignment
 *
 * Assigns a user to a project role.
 *
 * The request body should contain the employee number of the user to be assigned,
 * the project ID, and the role to be assigned (e.g., DRM, ARM, or HOD).
 *
 * @param {Request} req - Express request object containing the request body
 * @param {Response} res - Express response object to send the response
 * @returns {Promise<void>} - Promise indicating successful completion
 */
router.post("/assignment",
    authMiddleware,
    assignmentController);

export default router;