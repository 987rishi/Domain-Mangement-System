import {Router} from "express";
import { validateUserParams, validateUserRole } from "../middleware/validateUserParams.middleware.js";
import { 
  getUserDetailsByRole,
  getUserListByRole,
  getCentreList,
  getGroupList,
  getResponsibleOfficials,
  getAllGroupList,
  getAllCentreList,
  getProjectList,
  getProjectDetails } from "../controllers/userController.controller.js";

const router = Router();

// GET /api/users/details/:role/:empNo
// Input: role (e.g., 'drm', 'hod'), empNo (employee number)
router.get(
  "/details/:role/:empNo",
  // authenticateToken, // Apply authentication
  validateUserParams,
  getUserDetailsByRole
);


// GET /api/users/list/:role
// Input: role (e.g., 'drm', 'hod')
router.get(
  "/list/:role",
  // authenticateToken, // Apply authentication
 validateUserRole,
  getUserListByRole
);


// GET /api/users/centre/:centreid
// Fetches a single centre by its ID and provide all information of that centre
router.get("/centre/:centreid",  getCentreList);

// GET /api/users/group/:groupid
router.get("/group/:groupid",  getGroupList);

//GET /api/users/allcentres
router.get("/allcentres",  getAllCentreList);

//GET /api/users/allgroups
router.get("/allgroups",  getAllGroupList);

// GET /api/users/:empNo/officials
// fetch the hod and netops of drm and arm
router.get("/:empNo/officials", getResponsibleOfficials);

// GET /api/users/list/projects/:empNo
router.get("/list/projects/:empNo",  getProjectList);

// GET /api/users/projects/:projectid
router.get("/project/:projectId",  getProjectDetails);
export default router;

