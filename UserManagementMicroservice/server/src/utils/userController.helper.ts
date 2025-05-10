import { Role } from "@prisma/client";
import prisma from "../config/database.config";

/**
 * Maps a role string to the corresponding Prisma model.
 * 
 * The role string is case-insensitive.
 * 
 * If the role is not recognized, returns null.
 * 
 * @param {string} roleString - The role string (e.g. "DRM", "HOD", "ED", etc.)
 * 
 * @returns {Model | null} The Prisma model for the given role, or null if not recognized.
 */
export const getRoleInfo = (roleString: string) => {
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

/**
 * Recursively converts BigInt values within an object or array to strings.
 * 
 * This is necessary because JSON.stringify does not handle BigInt values.
 *
 * @param {any} obj - The input object or array containing potential BigInt values.
 * @returns {any} A new object or array with all BigInt values converted to strings.
 */
export const stringifyBigInts = (obj: any): any => {
  // Recursion base case: if obj is not an object or array, just return it as-is
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // If obj is an array, recursively process each element of the array
  if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts);
  }

  // If obj is an object, create a new object (newObj) with the same key-value pairs
  // as obj, but with any BigInt values converted to strings
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    // Check that the key is a valid property of obj (not a prototype property)
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // If the value is a BigInt, convert it to a string
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      }
      // If the value is an object or array, recursively process it
      else if (typeof value === "object") {
        newObj[key] = stringifyBigInts(value); // Recursively process nested objects/arrays
      }
      // Otherwise, just copy the value as-is
      else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
};


/**
 * Retrieves the role of a user based on their employee number.
 * 
 * @param {string|bigint} empNo - Employee number of the user
 * @returns {Promise<Role>} - Promise resolving to the role of the user
 */
export const getUserRole = async (
  empNo: string | bigint
): Promise<Role> => {
  try {
    // Convert input to BigInt for Prisma query
    // This is necessary because Prisma expects a BigInt for the where clause
    const empNoBigInt = BigInt(empNo);

    // Find the user in the appUser table by their employee number
    const user = await prisma.appUser.findUnique({
      // Assuming model name is 'User'
      where: { emp_no: empNoBigInt },
      // Select only the role and active status of the user
      // This is necessary because we don't want to fetch the entire user record
      select: { role: true },
    });

    // If user is not found, log an error and throw an error
    if (!user) {
      console.log(
        `User with emp_no ${empNo} not found in application database.`
      );
      throw new Error("User not provisioned in this app"); // User not provisioned in this app
    }

    // Return the role of the user
    // This is the final result of the function
    return user.role;

  } catch (error: any) {
    // Handle potential BigInt conversion errors
    // This can happen if the input is not a valid BigInt
    if (error instanceof Error && error.message.includes("Cannot convert")) {
      console.error(`Invalid employee number format for role lookup: ${empNo}`);
      throw new Error("Cannot look up role with invalid empNo format"); // Cannot look up role with invalid empNo format
    }
    // Handle other database errors
    // This can happen if there is an issue with the database connection
    console.error(`Error fetching role for emp_no ${empNo}:`, error);
    // Re-throw the error to be handled by the caller (e.g., login service)
    throw new Error(`Database error fetching user role: ${error.message}`);
  }
};


/**
 * Retrieves the group name associated with a user's role.
 * 
 * @param {string} empNo - The employee number of the user
 * @param {Role} role - The role of the user (e.g. DRM, ARM, HOD, etc.)
 * @returns {Promise<string | null>} - A promise resolving to the group name or null if no such group exists
 */
export const getUserGroupByRole = async (empNo: string, role: Role): Promise<string | null> => {
  // Get the Prisma model associated with the given role
  const userRole = getRoleInfo(role);
  if (!userRole) {
    // If the role is not recognized, throw an error
    throw new Error("Role not found");
  }

  // Convert the employee number to a BigInt for Prisma query
  const empNoBigInt = BigInt(empNo);

  // Find the user record in the role table by their employee number
  const user = await (userRole as any).findUnique({
    where: { emp_no: empNoBigInt },
  });

  // If the user is not found, return null
  if (!user) {
    return null;
  }

  if (!user.grp_id) {
    return null;
  }
  // Get the group name associated with the user's department ID
  const group = await prisma.groupDepartment.findUnique({
    where: { dept_id: user.grp_id },
    select: { d_name: true },
  });

  // Return the group name or null if no such group exists
  return group?.d_name ?? null;
};