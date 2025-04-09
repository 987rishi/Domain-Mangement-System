// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database.config.js";
// import * as ldapService from "../services/ldapService";
import { Role } from "@prisma/client"; // Import the enum

// --- Helper Function to Map Role String to Prisma Model/Enum ---
const getRoleInfo = (roleString: string) => {
  switch (roleString.toLowerCase()) {
    case "drm":
      return prisma.drm;
    case "arm":
      return prisma.arm;
    case "hod":
      return prisma.hod;
    case "ed":
      return prisma.edCentreHead; // ED not directly linked to GroupDept in schema
    case "webmaster":
      return prisma.webMaster; // Webmaster not linked to GroupDept
    case "netops":
      return prisma.memberNetops;
    // NetOps not linked to GroupDept
    case "hodhpc":
      return prisma.hodHpcIandE; // HodHpc not linked to Centre/Group
    default:
      return null;
  }
};

// --- Helper Function to Serialize BigInts in Response ---
// JSON.stringify doesn't handle BigInt, so we convert them to strings.
const stringifyBigInts = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      } else if (typeof value === "object") {
        newObj[key] = stringifyBigInts(value); // Recursively process nested objects/arrays
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
};

/**
 * GET /api/users/details/:role/:empNo
 * Fetches full details for a specific user from their corresponding role table.
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
 * Fetches a list of all active users belonging to a specific role.
 */
export const getUserListByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { role } = req.params;

  try {
    const roleInfo = getRoleInfo(role);
    if (!roleInfo) {
      res.status(400).json({ message: "Invalid role specified." });
      return;
    }

    // Query the specific role table for all active users
    const userList = await (roleInfo as any).findMany({
      where: {
        is_active: true, // Filter by the active flag on the role table itself
      },
      orderBy: {
        // Optional: Add default sorting
        emp_no: "asc", // Sort by last name if user is included
        // Or sort by a field on the role table directly, e.g., emp_no: 'asc'
      },
      // TODO: Add pagination later if needed (using skip, take)
    });

    // Serialize BigInts before sending
    res.status(200).json(stringifyBigInts(userList));
  } catch (error) {
    next(error);
  }
};

export const getCentreList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { centreid } = req.params;
  try {
    const centre = await prisma.centre.findUnique({
      where: {
        centre_id: parseInt(centreid),
      },
    });

    if (!centre) {
      res.status(404).json({ error: "Centre not found." });
      return;
    }
    res.status(200).json(centre);
  } catch (error) {
    res.status(400).send(`No centre found for centre_id ${centreid}`);
  }
};

export const getGroupList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { groupid } = req.params;
  try {
    const group = await prisma.groupDepartment.findUnique({
      where: {
        dept_id: parseInt(groupid),
      },
    });

    if (!group) {
      res.status(404).json({ error: "Centre not found." });
      return;
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(400).send(`No centre found for centre_id ${groupid}`);
  }
};

//get all groupList
export const getAllGroupList = async (req:Request,res:Response) =>{
  const allGroups = await prisma.groupDepartment.findMany({
    orderBy: {
      dept_id: 'asc',
    },
  });
  if(!allGroups){
    res.status(400).send("Error in finding groups");
    return;
  }
  res.status(200).json(allGroups);
}
//get all centreList
export const getAllCentreList = async (req: Request, res: Response) => {
  const allGroups = await prisma.centre.findMany({
    orderBy: {
      centre_id: "asc",
    },
  });
  if (!allGroups) {
    res.status(400).send("Error in finding groups");
    return;
  }
  res.status(200).json(allGroups);
};
// GET /api/users//:empNo/officials
// fetch the hod and netops of drm and arm
export const getResponsibleOfficials = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { empNo } = req.params;
  try {
    const user = await prisma.appUser.findUnique({
      where: { emp_no: BigInt(empNo) },
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    let centreId: number | null = null;
    let deptId: number | null = null;
    if (user.role === "DRM") {
      const drm = await prisma.drm.findUnique({
        where: { emp_no: BigInt(empNo) },
        select: {
          centre_id: true,
          grp_id: true,
          is_active: true,
        },
      });
      if (!drm || !drm.is_active) {
        res.status(404).json({ error: "DRM is not active." });
        return;
      }
      centreId = drm.centre_id;
      deptId = drm.grp_id;
    } else if (user.role === "ARM") {
      const arm = await prisma.arm.findUnique({
        where: { emp_no: BigInt(empNo) },
        select: {
          centre_id: true,
          grp_id: true,
          is_active: true,
        },
      });
      if (!arm || !arm.is_active) {
        res.status(404).json({ error: "DRM is not active." });
        return;
      }
      centreId = arm.centre_id;
      deptId = arm.grp_id;
    } else {
      res.status(400).json({ error: "Only DRM or ARM roles are supported." });
      return;
    }
    const hod = await prisma.hod.findFirst({
      where: {
        grp_id: deptId,
        centre_id: centreId,
        is_active: true,
      },
      select: {
        emp_no: true,
        hod_fname: true,
        hod_lname: true,
        email_id: true,
      },
    });
    const netops = await prisma.memberNetops.findUnique({
      where: { centre_id: centreId, is_active: true },
      select: {
        emp_no: true,
        fname: true,
        lname: true,
        email_id: true,
      },
    });

    res.json({
      role: user.role,
      hod,
      netops,
    });
    return;
  } catch (error) {
    console.error("Error fetching responsible officials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
