// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database.config.js";
import { Role } from "@prisma/client"; // Import the enum
import {
  getRoleInfo,
  stringifyBigInts
} from "../utils/userController.helper.js";
import { bigint } from "zod";

export const getUserDetails = async (req:Request,res:Response):Promise<void> => {
  const emp_no = req.params.empNo;
  if(!emp_no){
    res.status(400).json({ message: "Invalid employee number." });
    return;
  }
  try {
    const userData = await prisma.appUser.findUnique({
      where: {
        emp_no: BigInt(emp_no),
      },
    });
    
    if (!userData) {
      res.status(404).json({
        message: `User details not found for employee number '${emp_no}'.`,
      });
      return;
    }

    res.status(200).json(stringifyBigInts(userData));
  } catch (error) {
    res.status(400).json({ message: "Internal Server error in fetching details from user service" });
    console.log(error);
    return;
  }
  
};

/**
 *  GET: /api/users/details/:role/:empNo
 * 
 *  Fetches full details for a specific user from their corresponding role table.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express middleware function
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getUserDetailsByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { role, empNo } = req.params;
  const empNoBigInt = BigInt(empNo); // Convert param string to BigInt

  try {
    const roleInfo = getRoleInfo(role);
    if (!roleInfo) {
      // This check is technically redundant due to express-validator, but good practice
      res.status(400).json({ message: "Invalid role specified." });
      return;
    }

    // Query the specific role table (e.g., prisma.drmList, prisma.hodList)
    // The type assertion `as any` is sometimes needed because Prisma's model types vary
    const userDetails = await (roleInfo as any).findUnique({
      where: { emp_no: empNoBigInt }, // Find by employee number (which is the PK/FK)
    });

    if (!userDetails) {
      res.status(404).json({
        message: `User details not found for role '${role}' and employee number '${empNo}'.`,
      });
      return;
    }

    // Important: Check if the base user is active (if included) or if the role record has its own active flag
    if (
      (userDetails.user && !userDetails.user.is_active) ||
      !userDetails.is_active
    ) {
      res.status(404).json({
        message: `User details not found for role '${role}' and employee number '${empNo}' (user may be inactive).`,
      });
      return;
    }
    // Serialize BigInts to strings before sending
    res.status(200).json(stringifyBigInts(userDetails));
  } catch (error) {
    // Catch potential BigInt conversion errors or other issues
    if (error instanceof Error && error.message.includes("Cannot convert")) {
      res.status(400).json({ message: "Invalid employee number format." });
      return;
    }
    next(error);
  }
};


/**
 * GET /api/users/list/:role
 * 
 * Fetches a list of all active users belonging to a specific role.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const getUserListByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { role } = req.params;

  try {
    // Get the role info object from the role enum value
    const roleInfo = getRoleInfo(role);
    if (!roleInfo) {
      // If not found, return a 400 error with a user-friendly message
      res.status(400).json({ message: "Invalid role specified." });
      return;
    }

    // Query the specific role table for all active users
    const userList = await (roleInfo as any).findMany({
      // Filter by the active flag on the role table itself
      where: {
        is_active: true,
      },
      // Optional: Add default sorting
      orderBy: {
        // Sort by last name if user is included
        emp_no: "asc",
        // Or sort by a field on the role table directly, e.g., emp_no: 'asc'
      },
      // TODO: Add pagination later if needed (using skip, take)
    });

    // Serialize BigInts before sending
    res.status(200).json(stringifyBigInts(userList));
  } catch (error) {
    // Catch any errors and pass them to the next function
    next(error);
  }
};


/**
 * GET /api/users/centre/:centreid
 * 
 * Fetches a single centre by its ID and provide all information of that centre
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getCentreList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { centreid } = req.params;
  try {
    // Get the centre from the database by its ID
    const centre = await prisma.centre.findUnique({
      where: {
        // Use the centre_id as the lookup key
        centre_id: parseInt(centreid),
      },
    });

    if (!centre) {
      // If the centre isn't found, return a 404 error with a user-friendly message
      res.status(404).json({ error: "Centre not found." });
      return;
    }

    // Send the centre data as JSON
    res.status(200).json(centre);
  } catch (error) {
    // Catch any errors and send a 400 error with a user-friendly message
    res.status(400).send(`No centre found for centre_id ${centreid}`);
  }
};



/**
 * GET /api/users/group/:groupid
 * 
 * Fetches a single group department by its ID.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getGroupList = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extract the group ID from the URL parameters
  const { groupid } = req.params;

  try {
    // Query the database to find the group department by its ID
    const group = await prisma.groupDepartment.findUnique({
      where: {
        // Use the dept_id as the lookup key
        dept_id: parseInt(groupid),
      },
    });

    // If the group isn't found, return a 404 error with a user-friendly message
    if (!group) {
      res.status(404).json({ error: "Group not found." });
      return;
    }

    // Send the group data as JSON
    res.status(200).json(group);
  } catch (error) {
    // Catch any errors and send a 400 error with a user-friendly message
    res.status(400).send(`No group found for group_id ${groupid}`);
  }
};



/**
 * GET /api/users/allgroups
 * 
 * Retrieves all group departments from the database in ascending order of department ID.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getAllGroupList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve all group departments from the database, ordered by department ID in ascending order
    const allGroups = await prisma.groupDepartment.findMany({
      // Sort the results by department ID in ascending order
      orderBy: {
        dept_id: 'asc',
      },
    });

    // Check if the query returned no results
    if (!allGroups) {
      // Respond with a 400 status code and an error message if no groups were found
      res.status(400).send("Error in finding groups");
      return;
    }

    // Respond with a 200 status code and the list of groups as JSON if found
    res.status(200).json(allGroups);
  } catch (error) {
    // Catch any unexpected errors that occur during the execution
    res.status(500).send("An error occurred while retrieving groups");
  }
};


/**
 * GET /api/users/allcentres
 * 
 * Retrieves all centres from the database in ascending order of centre ID.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getAllCentreList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve all centres from the database, ordered by centre ID in ascending order
    const allGroups = await prisma.centre.findMany({
      // Sort the results by centre ID in ascending order
      orderBy: {
        centre_id: 'asc',
      },
    });

    // Check if the query returned no results
    if (!allGroups) {
      // Respond with a 400 status code and an error message if no groups were found
      res.status(400).send("Error in finding groups");
      return;
    }

    // Respond with a 200 status code and the list of groups as JSON if found
    res.status(200).json(allGroups);
  } catch (error) {
    // Catch any unexpected errors that occur during the execution
    res.status(500).send("An error occurred while retrieving groups");
  }
};


/**
 * GET /api/users/:empNo/officials
 * 
 * Retrieves the HOD and NetOps member responsible for the specified user.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getResponsibleOfficials = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extract employee number from request parameters
  const { empNo } = req.params;

  try {
    // Find the user in the appUser table by their employee number
    const user = await prisma.appUser.findUnique({
      where: { emp_no: BigInt(empNo) },
    });

    // If user is not found, return a 404 error response
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Initialize variables for centre and department IDs
    let centreId: number | null = null;
    let deptId: number | null = null;

    // Check the role of the user and fetch corresponding details
    if (user.role === "DRM") {
      // If role is DRM, find the DRM record by employee number
      const drm = await prisma.drm.findUnique({
        where: { emp_no: BigInt(empNo) },
        select: {
          centre_id: true,
          grp_id: true,
          is_active: true,
        },
      });

      // If DRM record is not found or not active, return a 404 error response
      if (!drm || !drm.is_active) {
        res.status(404).json({ error: "DRM is not active." });
        return;
      }

      // Set centre and department IDs from DRM record
      centreId = drm.centre_id;
      deptId = drm.grp_id;
    } else if (user.role === "ARM") {
      // If role is ARM, find the ARM record by employee number
      const arm = await prisma.arm.findUnique({
        where: { emp_no: BigInt(empNo) },
        select: {
          centre_id: true,
          grp_id: true,
          is_active: true,
        },
      });

      // If ARM record is not found or not active, return a 404 error response
      if (!arm || !arm.is_active) {
        res.status(404).json({ error: "DRM is not active." });
        return;
      }

      // Set centre and department IDs from ARM record
      centreId = arm.centre_id;
      deptId = arm.grp_id;
    } else {
      // If role is neither DRM nor ARM, return a 400 error response
      res.status(400).json({ error: "Only DRM or ARM roles are supported." });
      return;
    }

    // Find the HOD for the centre and department
const [hod, netops, ed, webmaster, hodHpcIandE] = await Promise.all([
  // Find HOD for the specific department and centre
  prisma.hod.findFirst({
    // Assuming model name HodList
    where: {
      grp_id: deptId,
      centre_id: centreId,
      is_active: true,
    },
    select: { emp_no: true, hod_fname: true, hod_lname: true, email_id: true }, // Use specific HOD fields
  }),
  // Find NetOps for the specific centre
  prisma.memberNetops.findUnique({
    // Assuming model name MemberNetops
    // The schema implies centre_id is unique on MemberNetops, so findUnique is appropriate
    where: { centre_id: centreId /* , is_active: true */ }, // is_active might not be on the where unique clause
    select: {
      emp_no: true,
      fname: true,
      lname: true,
      email_id: true,
      is_active: true,
    },
  }),
  // Find ED (Centre Head) for the specific centre
  prisma.edCentreHead.findUnique({
    // Assuming model name EdCentreHead
    where: { centre_id: centreId /* , is_active: true */ },
    select: {
      emp_no: true,
      fname: true,
      lname: true,
      email_id: true,
      is_active: true,
    },
  }),
  // Find Webmaster for the specific centre
  prisma.webMaster.findFirst({
    // Using findFirst for safety, assuming model name WebMaster
    where: { centre_id: centreId, is_active: true },
    select: { emp_no: true, fname: true, lname: true, email_id: true },
  }),
  // Find the specific HOD HPC I&E (assuming only one active system-wide based on schema)
  prisma.hodHpcIandE.findFirst({
    // Assuming model name HodHpcIandE
    where: { is_active: true },
    select: { emp_no: true, fname: true, lname: true, email_id: true },
  }),
]);

// Filter out inactive officials before sending response (double-check)
const activeNetops = netops?.is_active ? netops : null;
const activeEd = ed?.is_active ? ed : null;
// Assuming hod, webmaster, hodHpcIandE queries already filter by is_active

// 4. Respond with all fetched details
// Convert BigInt emp_no to strings for JSON compatibility before sending
const stringifyEmpNo = (official: any) =>
  official ? { ...official, emp_no: official.emp_no.toString() } : null;

res.json({
  requestingUserRole: user.role, // Role of the user making the request
  hod: stringifyEmpNo(hod), // HOD of the specific Group/Centre
  netops: stringifyEmpNo(activeNetops), // NetOps of the specific Centre
  ed: stringifyEmpNo(activeEd), // ED of the specific Centre
  webmaster: stringifyEmpNo(webmaster), // Webmaster of the specific Centre
  hodHpcIandE: stringifyEmpNo(hodHpcIandE), // The specific HPC/I&E HOD role
});
    return;
  } catch (error) {
    // Log the error to the console and respond with a 500 error
    console.error(
      "Error fetching responsible officials:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Internal server error" });
  }
};



/**
 * GET /api/projects/:empNo
 * 
 * Fetches a list of projects that the specified employee number is associated with.
 * 
 * The association is determined by the following conditions:
 * 
 * 1. The employee is the HOD of the project.
 * 2. The employee is the ARM of the project.
 * 3. The employee is the DRM of the project.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getProjectList = async (req: Request, res: Response): Promise<void> => {
  const { empNo } = req.params;
  const employeeNo = BigInt(empNo);
  if(!employeeNo){
    res.status(400).json({ message: "Invalid employee number." });
    return;
  }
  try {
    // Find all projects where the employee number matches one of the roles
    const projects = await prisma.projectAssignment.findMany({
      where: {
        // Use the OR operator to match any of the following conditions
        OR: [
          // The employee is the HOD of the project
          { hod_emp_no: employeeNo },
          // The employee is the ARM of the project
          { arm_emp_no: employeeNo },
          // The employee is the DRM of the project
          { drm_emp_no: employeeNo },
        ],
      },
      // Include the DRM, ARM, and HOD details in the response
      include: {
        drm: true,
        arm: true,
        hod: true,
      },
    });
    if (projects.length === 0) {
      res.status(404).json({ message: "No projects found for employee number" });
      return;
    }
    // Return the list of projects
    res.status(200).json(stringifyBigInts(projects));
    return;
  } catch (error) {
    // If there's an error, log it and return a 404 error with a message
    console.error(
      "Error fetching projects for employee number %s:",
      empNo,
      error instanceof Error ? error.message : error
    );
    res.status(404).json({ message: "Error in fetching projects" });
    return;
  }
};


/**
 * GET /api/projects/:projectId
 * 
 * Retrieves the details of a project by its project ID.
 * 
 * The response will include the DRM, ARM, and HOD details associated with the project.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const getProjectDetails = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params;
  try {
    // Find the project assignment record by its project ID
    const projectDetails = await prisma.projectAssignment.findUnique({
      // Use the project ID as the lookup key
      where: { project_id: BigInt(projectId) },
      // Include the DRM, ARM, and HOD details in the response
      include: {
        // Include the DRM (Data Repository Manager) details
        drm: true,
        // Include the ARM (Application Repository Manager) details
        arm: true,
        // Include the HOD (Head of Department) details
        hod: true,
      },
    });

    // If the project assignment record is not found, return a 404 error with a message
    if (!getProjectDetails) {
      res.status(404).json({ error: "Project not found." });
      return;
    }
    if (!projectDetails?.hod || !projectDetails.hod.centre_id) {
      console.error(
        `HOD details or Centre ID missing for project ${projectId}`
      );
      res
        .status(404)
        .json({
          error:
            "Associated HOD or Centre information missing for the project.",
        });
      return;
    }
    if (!projectDetails.hod.is_active) {
      res
        .status(404)
        .json({ error: "The HOD associated with this project is inactive." });
      return;
    }

    const centreId = projectDetails.hod.centre_id; // Get centreId from the project's HOD

    // 2. Fetch emp_no for other relevant officials based on centreId or globally
    // Using Promise.all for efficiency
    const [edInfo, netopsInfo, webmasterInfo, hodHpcInfo] = await Promise.all([
      // ED for the centre
      prisma.edCentreHead.findUnique({
        where: { centre_id: centreId },
        select: { emp_no: true, is_active: true }, // Only fetch emp_no and active status
      }),
      // NetOps for the centre
      prisma.memberNetops.findUnique({
        where: { centre_id: centreId },
        select: { emp_no: true, is_active: true },
      }),
      // Webmaster for the centre (finding the first active one)
      prisma.webMaster.findFirst({
        where: { centre_id: centreId, is_active: true },
        select: { emp_no: true }, // Assume already filtered by active
      }),
      // HodHpcIandE (finding the first active one globally)
      prisma.hodHpcIandE.findFirst({
        where: { is_active: true },
        select: { emp_no: true },
      }),
    ]);

    // Filter out inactive ED/NetOps
    const activeEdEmpNo = edInfo?.is_active ? edInfo.emp_no : null;
    const activeNetopsEmpNo = netopsInfo?.is_active ? netopsInfo.emp_no : null;

    // 3. Construct the final response object
    const responseData = {
      ...projectDetails, // Include original project details (DRM, ARM, HOD objects)
      // Add the additional employee numbers
      responsibleOfficials: {
        hod_emp_no: projectDetails.hod.emp_no, // Already fetched
        ed_emp_no: activeEdEmpNo,
        netops_emp_no: activeNetopsEmpNo,
        webmaster_emp_no: webmasterInfo?.emp_no || null, // Use optional chaining
        hod_hpc_iande_emp_no: hodHpcInfo?.emp_no || null, // Use optional chaining
      },
    };
    // Return the project assignment record, including the DRM, ARM, and HOD details
    res.status(200).json(stringifyBigInts(responseData));
  } catch (error) {
    // If there's an error, log it and return a 404 error with a message
    console.error(
      "Error fetching project details for project_id %s:",
      projectId,
      error instanceof Error ? error.message : error
    );
    res.status(404).send(`No project found for project_id ${projectId}`);
  }
};
