"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updateController_controller_1 = require("../controllers/updateController.controller");
const router = (0, express_1.Router)();
// PATCH: /api/update/users/:empNo
/**
 * Updates the user details in the database.
 *
 * @remarks
 * This endpoint is used to update the details of a user in the database.
 * The request body should contain the employee number, designation, telephone number, and mobile number.
 *
 * @param empNo - The employee number of the user to be updated.
 * @param designation - The designation of the user.
 * @param tele_no - The telephone number of the user.
 * @param mob_no - The mobile number of the user.
 *
 * @returns A JSON object with a message indicating whether the update was successful.
 */
router.put("/:empNo", updateController_controller_1.updateController);
exports.default = router;
