import { Request, Response } from "express";
import prisma from "../config/database.config";
import logger from "../config/logger.config";

/**
 * PATCH: /api/update/users/:empNo
 *
 * Updates the user details in the database based on the role of the user (DRM or ARM).
 * 
 * The request must include the employee number, designation, telephone number, and mobile number.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise indicating successful completion
 */
export const updateController = async (req: Request, res: Response): Promise<void> => {
    const { empNo } = req.params;
    const { designation, tele_no, mob_no } = req.body;

    if (!designation || !tele_no || !mob_no) {
        logger.warn("Update failed due to missing required fields", {
          targetEmpNo: empNo,
          requestBody: req.body,
        });
        res.status(400).json({ message: "Missing required fields." });
        return;
    }

    try {
        const updateUser = await prisma.appUser.findUnique({
            where: { emp_no: BigInt(empNo) }
        });

        if (!updateUser) {
            res.status(404).json({ message: `User not found for employee number ${empNo}.` });
             logger.warn("Update failed: User not found in appUser table", {
               targetEmpNo: empNo
             });
            // console.log(`User not found for employee number ${empNo}.`);
            return;
        }

        if (updateUser.role === "DRM") {
            await prisma.drm.update({
                where: { emp_no: BigInt(empNo) },
                data: { desig: designation, tele_no, mob_no }
            });
            logger.info("DRM details updated successfully", {
              targetEmpNo: empNo,
              updatedData: { designation, tele_no, mob_no },
            });
            res.status(200).json({ message: `DRM details updated successfully for employee number ${empNo}.` });
            
            return;
        } else if (updateUser.role === "ARM") {
            await prisma.arm.update({
                where: { emp_no: BigInt(empNo) },
                data: { desig: designation, tele_no, mob_no }
            });
             logger.info("DRM details updated successfully", {
               targetEmpNo: empNo,
               updatedData: { designation, tele_no, mob_no },
             });
            res.status(200).json({ message: `ARM details updated successfully for employee number ${empNo}.` });
            // console.log(`ARM details updated successfully for employee number ${empNo}.`);
            return;
        } else {
            res.status(404).json({ message: `No DRM and ARM found for employee number ${empNo}.` });
            logger.warn("Update failed: User does not have a DRM or ARM role", {
              targetEmpNo: empNo,
            });
            // console.log(`No DRM and ARM found for employee number ${empNo}.`);
            return;
        }

    } catch (error) {
        // console.error(error);
        logger.error("An unexpected error occurred during the update process", {
          targetEmpNo: empNo,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack,
        });
        res.status(500).json({ message: "Internal server error." });
        return;
    }
}
