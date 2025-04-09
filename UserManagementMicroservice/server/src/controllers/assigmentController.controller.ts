import { Request, Response } from "express";
import { findUserByIdentifier } from "../services/ldapAuth";
import prisma from "../config/database.config";
import { Role } from "@prisma/client";

export const assignmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { project_name, project_remarks, drm_emp_no, arm_emp_no } = req.body;
  const hod_emp_no = 3001; // later use req.user?.emp_no

  if (!project_name || !drm_emp_no || !arm_emp_no || !hod_emp_no) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const hod = await tx.hod.findUnique({
        where: { emp_no: hod_emp_no },
      });

      if (!hod) throw new Error("HOD not found in database");

      const { centre_id, grp_id } = hod;
    const validateUserAndStatus = async (
      emp_no: number,
      role: Role,
      table: "drm" | "arm"
    ) => {
      const existingUser = await tx.appUser.findUnique({ where: { emp_no } });

      if (existingUser) {
        // Check if the person is active in respective table
        const roleRecord = await (table === "drm"
          ? tx.drm.findUnique({ where: { emp_no } })
          : tx.arm.findUnique({ where: { emp_no } }));

        if (!roleRecord?.is_active) {
          throw new Error(
            `${table.toUpperCase()} with emp_no ${emp_no} is not active.`
          );
        }

        // Optional: check for conflicts with LDAP here if needed
        return;
      }

      // If not found, fetch from LDAP and create as usual
      const ldapData = await findUserByIdentifier(emp_no);
      if (!ldapData) throw new Error(`${role} not found in LDAP.`);

      const [firstName, ...rest] = ldapData.fullName.split(" ");
      const lastName = rest.join(" ") || "";

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


      // Insert DRM and ARM users if not already present
      await validateUserAndStatus(drm_emp_no, Role.DRM, "drm");
      await validateUserAndStatus(arm_emp_no, Role.ARM, "arm");

      // Create Project Assignment only after users and roles exist
      const assignment = await tx.projectAssignment.create({
        data: {
          project_name,
          project_remarks,
          hod_emp_no,
          drm_emp_no,
          arm_emp_no,
        },
      });

      return assignment;
    });
    const safeJson = (data: any) =>
      JSON.parse(
        JSON.stringify(data, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
    res.status(201).json({ message: "Project assigned successfully", result: safeJson(result), });  
  } catch (error: any) {
    console.error("Assignment error:", error);
    res
      .status(500)
      .json({ message: error.message || "Error assigning project." });
  }
};
