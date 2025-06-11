import { Request, Response } from "express";
import { findUserByIdentifier } from "../services/ldapAuth";
import prisma from "../config/database.config";
import { Role } from "@prisma/client";
import { stringifyBigInts } from "../utils/userController.helper";
import { assignmentSchemaValidation } from "../middleware/schemaValidation";
import { formatError } from "../utils/helper";
import { findNotificationServiceUrl } from "../services/notificationSender";
import axios from "axios";
/**
     * This is the transaction that creates the project assignment. If any of the
     * operations inside the transaction throw an error, the entire transaction
     * will be rolled back.
     * 
     * This is the helper function that checks if a user exists in the appUser
     * table and is active in the respective table (either the drm table or
     * the arm table). If the user doesn't exist in the appUser table, it
     * fetches the user from LDAP and creates a new record in the appUser table.
     * It then creates a new record in either the drm table or the arm table,
     * depending on the role that was passed in.
     * 
     
*/

/**
 * This endpoint creates a new project assignment. It takes in the project name,
 * project remarks, DRM employee number, and ARM employee number. It then checks
 * if all of the required fields are present, and if not, returns a 400 error
 * response. If all of the required fields are present, it proceeds to create
 * the project assignment.
 *
 * The project assignment is created in a transaction, meaning that either all
 * of the operations in the transaction succeed, or none of them do. This is
 * important because we don't want to have a situation where the project
 * assignment is created, but the DRM and ARM users aren't. Or vice versa.
 *
 * Inside the transaction, we first try to find the HOD user by their employee
 * number. If the HOD user isn't found, we throw an error that will cause the
 * transaction to rollback. If the HOD user is found, we extract the centre ID
 * and group ID from their record.
 *
 * Next, we define a helper function called `validateUserAndStatus`. This
 * function takes in an employee number, a role (either "DRM" or "ARM"), and a
 * table name (either "drm" or "arm"). It then checks if the user with the
 * given employee number exists in the appUser table. If the user exists, it
 * checks if the user is active in the respective table (either the drm table
 * or the arm table). If the user is not active, it throws an error. If the
 * user is active, it returns without doing anything else.
 *
 * If the user doesn't exist in the appUser table, it fetches the user from
 * LDAP and creates a new record in the appUser table. It then creates a new
 * record in either the drm table or the arm table, depending on the role that
 * was passed in.
 *
 * After defining the `validateUserAndStatus` function, we call it twice: once
 * for the DRM user, and once for the ARM user. If either of these calls
 * throws an error, the transaction will rollback.
 *
 * Finally, we create the project assignment itself. We do this only after
 * checking that the DRM and ARM users exist and are active.
 */
export const assignmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // const { project_name, project_remarks,drm_emp_no,arm_emp_no} = req.body;
  try {
  const assignDrmArmBody = req.body;
  const webhookAPI = await findNotificationServiceUrl();
  const payload = assignmentSchemaValidation.safeParse(assignDrmArmBody);
  if (!payload.success) {
    const errors = formatError(payload.error);
    // console.log("Validation error:", errors);
    res.status(422).json({ message: "Validation error", errors });
    return;
  }

  const project_name = payload.data.project_name;
  const project_remarks = payload.data.project_remarks;
  const drm_emp_no = payload.data.drm_emp_no;
  const arm_emp_no = payload.data.arm_emp_no;

  const hod_emp_no = req.user?.id;
  console.log("The hod emp no is: ", hod_emp_no);

  if (!hod_emp_no) {
    res.status(401).json({ message: "Not a valid Users" });
    return;
  }

  
    // Create a new transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the HOD user by their employee number
      const hod = await tx.hod.findUnique({
        where: { emp_no: BigInt(hod_emp_no) },
      });

      if (!hod) throw new Error("HOD not found in database");

      // Extract the centre ID and group ID from the HOD record
      const { centre_id, grp_id } = hod;

      // Define the validateUserAndStatus function
      const validateUserAndStatus = async (
        emp_no: number,
        role: Role,
        table: "drm" | "arm"
      ) => {
        // Check if the user already exists in the appUser table
        const existingUser = await tx.appUser.findUnique({ where: { emp_no } });

        if (existingUser) {
          // Check if the user is active in the respective table
          const roleRecord = await (table === "drm"
            ? tx.drm.findUnique({ where: { emp_no } })
            : tx.arm.findUnique({ where: { emp_no } }));

          if (!roleRecord?.is_active) {
            // If the user is not active, throw an error that will cause the transaction to rollback
            throw new Error(
              `${table.toUpperCase()} with emp_no ${emp_no} is not active.`
            );
          }

          // Optional: check for conflicts with LDAP here if needed
          return;
        }

        // If the user doesn't exist, fetch from LDAP and create as usual
        const ldapData = await findUserByIdentifier(emp_no);
        if (!ldapData) throw new Error(`${emp_no} not found in LDAP.`);
        // if(!ldapData) {
        //   res.status(500).json({message:`${role} not found in LDAP.`});
        //   return;
        // }
        // Split the full name into first name and last name
        const [firstName, ...rest] = ldapData.fullName.split(" ");
        const lastName = rest.join(" ") || "";

        // Create a new record in the appUser table
        await tx.appUser.create({
          data: {
            emp_no,
            usr_email: ldapData.employeeEmail,
            usr_fname: firstName,
            usr_lname: lastName,
            role,
            centre_id,
          },
        });

        // Create a new record in either the drm table or the arm table
        if (table === "drm") {
          await tx.drm.create({
            data: {
              emp_no,
              email_id: ldapData.employeeEmail,
              drm_fname: firstName,
              drm_lname: lastName,
              desig: null,
              tele_no: null,
              mob_no: null,
              centre_id,
              grp_id,
            },
          });
        } else {
          await tx.arm.create({
            data: {
              emp_no,
              email_id: ldapData.employeeEmail,
              arm_fname: firstName,
              arm_lname: lastName,
              desig: null,
              tele_no: null,
              mob_no: null,
              centre_id,
              grp_id,
            },
          });
        }
      };

      // Call the validateUserAndStatus function for the DRM user
      await validateUserAndStatus(Number(drm_emp_no), Role.DRM, "drm");

      // Call the validateUserAndStatus function for the ARM user
      await validateUserAndStatus(Number(arm_emp_no), Role.ARM, "arm");

      // Create the project assignment only after the users and roles exist
      const assignment = await tx.projectAssignment.create({
        data: {
          project_name,
          project_remarks,
          hod_emp_no: BigInt(hod_emp_no),
          drm_emp_no: BigInt(drm_emp_no),
          arm_emp_no: BigInt(arm_emp_no),
        },
      });

      return assignment;
    });

    // Return the result of the transaction
    res
      .status(201)
      .json({
        message: "Project assigned successfully",
        result: stringifyBigInts(result),
      });
   try {
     // send the notification
     await axios.post(
       webhookAPI,
       {
         eventType: "PROJECT_ASSIGNED",
         timestamp: new Date().toISOString(),
         triggeredBy: {
           emp_no: Number(hod_emp_no),
           role: "HOD",
         },
         data: {
           domainName: project_name,
           remarks: project_remarks,
         },
         recipients: {
           drm_emp_no: Number(drm_emp_no),
           arm_emp_no: Number(arm_emp_no),
         },
       },
       {
         headers: {
           "X-Webhook-Secret": "cdac@notificationSecret789",
         },
       }
     );
   } catch (error) {
    console.warn("Webhook notification failed:", error);
   }
  } catch (error: any) {
    console.error("Assignment error:", error);
    res
      .status(500)
      .json({ message: error.message || "Error assigning project." });
  }
};
