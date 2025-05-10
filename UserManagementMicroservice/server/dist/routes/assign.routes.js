"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assigmentController_controller_1 = require("../controllers/assigmentController.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
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
router.post("/assignment", authMiddleware_1.authMiddleware, assigmentController_controller_1.assignmentController);
exports.default = router;
