import { Request, Response } from "express";
import prisma from "../config/database.config";

export const updateController = async (req: Request, res: Response):Promise<void> => {
    const { empNo } = req.params;
    const {designation,tele_no,mob_no} = req.body;
    if(!designation || !tele_no || !mob_no){
        res.status(400).json({ message: "Missing required fields." });
        return;
    }
    try{
        const updateUser = await prisma.appUser.findUnique({
            where: { emp_no: BigInt(empNo),
               }
        });
        if (!updateUser) {
            res.status(404).json({ message: `User not found for employee number ${empNo}.` });
            console.log(`User not found for employee number ${empNo}.` );
            return;
        }
        if(updateUser.role === "DRM" ){
            await prisma.drm.update({
                where: { emp_no: BigInt(empNo) },
                data: {
                    desig:designation,
                    tele_no,
                    mob_no,
                },
            });
            res.status(200).json({ message: `DRM details updated successfully for employee number ${empNo}.` });
            console.log(
              `DRM details updated successfully for employee number ${empNo}.`
            );
            return;
        }else if(updateUser.role === "ARM"){
            await prisma.arm.update({
                where: { emp_no: BigInt(empNo) },
                data: {
                    desig:designation,
                    tele_no,
                    mob_no,
                },
            });
            res.status(200).json({ message: `ARM details updated successfully for employee number ${empNo}.` });
            console.log(
              `ARM details updated successfully for employee number ${empNo}.`
            );
            return;
        }else{
            res.status(404).json({ message: `No DRM and ARM found for employee number ${empNo}.` });
            console.log(`No DRM and ARM found for employee number ${empNo}.` );
            return;
        }

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
}