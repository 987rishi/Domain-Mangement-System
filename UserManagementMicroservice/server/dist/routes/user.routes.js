"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateUserParams_middleware_js_1 = require("../middleware/validateUserParams.middleware.js");
const userController_controller_js_1 = require("../controllers/userController.controller.js");
const router = (0, express_1.Router)();
// GET /api/users/details/:role/:empNo
// Input: role (e.g., 'drm', 'hod'), empNo (employee number)
router.get("/details/:role/:empNo", 
// authenticateToken, // Apply authentication
validateUserParams_middleware_js_1.validateUserParams, userController_controller_js_1.getUserDetailsByRole);
// GET /api/users/list/:role
// Input: role (e.g., 'drm', 'hod')
router.get("/list/:role", 
// authenticateToken, // Apply authentication
validateUserParams_middleware_js_1.validateUserRole, userController_controller_js_1.getUserListByRole);
// GET /api/users/centre/:centreid
// Fetches a single centre by its ID and provide all information of that centre
router.get("/centre/:centreid", userController_controller_js_1.getCentreList);
// GET /api/users/group/:groupid
router.get("/group/:groupid", userController_controller_js_1.getGroupList);
//GET /api/users/allcentres
router.get("/allcentres", userController_controller_js_1.getAllCentreList);
//GET /api/users/allgroups
router.get("/allgroups", userController_controller_js_1.getAllGroupList);
// GET /api/users/:empNo/officials
// fetch the hod and netops of drm and arm
router.get("/:empNo/officials", userController_controller_js_1.getResponsibleOfficials);
// GET /api/users/list/projects/:empNo
router.get("/list/projects/:empNo", userController_controller_js_1.getProjectList);
// GET /api/users/projects/:projectid
router.get("/project/:projectId", userController_controller_js_1.getProjectDetails);
exports.default = router;
