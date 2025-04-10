import prisma from "../database/prisma";
import dummyDB from "../../dummyDB.json";
import { NextFunction, Request, Response } from "express";
import { IpRenewalRequestStatus } from "@prisma/client";

// @desc Creates a ip renewal
// @route POST /api/renwals/ip/create
// @access Private
export const createIpRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { ip_id, prev_ip_addrs, aprvl_pdf, drm_remarks } = req.body;

  if (!ip_id || !aprvl_pdf || !prev_ip_addrs) {
    console.error("ALL FIELDS ARE NOT PRESENT".red);
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  try {
    /* Check for a ongoing renewal for ip_id */
    const renewalExists = await prisma.ipRenewal.findFirst({
      where: {
        ip_id,
        status: { not: IpRenewalRequestStatus.RENEWED_BY_NETOPS },
      },
    });

    if (renewalExists) {
      console.error("RENEWAL FOR THE IP IS ALREADY IN THE RENEWAL PROCESS".red);
      res.status(403).json({
        message:
          "Renewal for the ip_id already exists. Another renewal cannot be created.",
      });
      return;
    }

    const count = await prisma.ipRenewal.count({
      where: {
        ip_id,
      },
    });

    const rnwl_no = count + 1;
    const newRenewal = await prisma.ipRenewal.create({
      data: {
        ip_id,
        aprvl_pdf,
        prev_ip_addrs,
        drm_remarks: drm_remarks ? drm_remarks : "NA",
        rnwl_no: rnwl_no,
        rqst_date: new Date(),
        // created_by_drm,
        // aprvd_by_hod,
        // rnwd_by_netops,
      },
    });

    if (!newRenewal) {
      console.error("FAILED TO CREATE A IP RENEWAL".red);
      res
        .status(500)
        .json({ message: "Failed to create a ip renewal. Please try again." });
      return;
    }

    res.status(201).json({ ip_rn_id: newRenewal.ip_rnwl_id.toString() });
  } catch (error) {
    console.error("SOMETHING WENT WRONG WHILE CREATING A RENEWAL.".red, error);
    res
      .status(500)
      .json({ message: "Failed to create a renewal. Please try again." });
    return;
  }
};

// @desc Approves a pending ip renewal request
// @route POST /api/renwals/ip/:ipRnwlId/approve
// @access Private
export const approveIpRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip_rnwl_id = parseInt(req.params.ipRnwlId);
  const { hod_empno, hod_remarks } = req.body;

  // Check if all fields are present [ and their data types ]
  if (isNaN(ip_rnwl_id) || /* !is_aprvd || */ !hod_remarks) {
    console.error(`field validation failed`.red);
    res
      .status(400)
      .json({ message: "Please provid all fields with the correct format." });
    return;
  }

  try {
    // Check if the renewal exists in the database
    const renewal = await prisma.ipRenewal.findUnique({
      where: { ip_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    // Check for a rejected renewal
    // if (renewal.status !== IpRenewalRequestStatus.REJECTED_BY_HOD) {
    //     console.error(`Requests already been approved`.red);
    //     res.status(403).json({ message: `Forbidden Action: Renewal with the given id ${ip_rnwl_id} has already been approved`})
    //     return;
    // }

    // Check if it is a renewal that has already been approved
    if (renewal.status !== IpRenewalRequestStatus.PENDING_APPROVAL) {
      console.error(`Requests already been approved`.red);
      res.status(403).json({
        message: `Forbidden Action: Renewal with the given id ${ip_rnwl_id} has already been approved`,
      });
      return;
    }

    const approvedRenewal = await prisma.ipRenewal.update({
      where: {
        ip_rnwl_id,
      },
      data: {
        is_aprvd: true,
        aprvl_date: new Date(),
        hod_remarks,
        status: IpRenewalRequestStatus.APPROVED_BY_HOD,
      },
    });

    res.status(200).json({ ip_rnwl_id: approvedRenewal.ip_rnwl_id.toString() });
    return;
  } catch (error) {
    console.error("Something went wrong while approving renewal".red, error);
    res
      .status(400)
      .json({ message: "Approval failed. Please try again later." });
    return;
  }
  res.status(200).send("Working");
};

// @desc Rejects a pending ip renewal
// @route POST /api/renwals/ip/:ipRnwlId/reject
// @access Private
export const rejectIpRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip_rnwl_id = parseInt(req.params.ipRnwlId);
  const { hod_empno, hod_remarks } = req.body;

  // Check if all fields are present [ and their data types ]
  if (isNaN(ip_rnwl_id) || /* !is_aprvd || */ !hod_remarks) {
    console.error(`field validation failed`.red);
    res
      .status(400)
      .json({ message: "Please provide all fields with the correct format." });
    return;
  }

  try {
    // Check if the renewal exists in the database
    const renewal = await prisma.ipRenewal.findUnique({
      where: { ip_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    // Check for a rejected renewal
    // if (renewal.status !== IpRenewalRequestStatus.REJECTED_BY_HOD) {
    //     console.error(`Requests already been approved`.red);
    //     res.status(403).json({ message: `Forbidden Action: Renewal with the given id ${ip_rnwl_id} has already been approved`})
    //     return;
    // }

    // Check if it is a renewal that has already been approved
    if (renewal.status !== IpRenewalRequestStatus.PENDING_APPROVAL) {
      console.error(`Requests already been approved/rejected`.red);
      res.status(403).json({
        message: `Forbidden Action: Renewal with the given id ${ip_rnwl_id} has already been approved/rejected.`,
      });
      return;
    }

    const approvedRenewal = await prisma.ipRenewal.update({
      where: {
        ip_rnwl_id,
      },
      data: {
        is_aprvd: false,
        aprvl_date: new Date(),
        hod_remarks,
        status: IpRenewalRequestStatus.REJECTED_BY_HOD,
      },
    });

    res.status(200).json({ ip_rnwl_id: approvedRenewal.ip_rnwl_id.toString() });
    return;
  } catch (error) {
    console.error("Something went wrong while rejecting renewal".red, error);
    res
      .status(400)
      .json({ message: "Rejection failed. Please try again later." });
    return;
  }
  res.status(200).send("Working");
};

// @desc Reviews a ip renewal
// @route POST /api/renwals/ip/:ipRnwlId/review
// @access Private
// TODO Decide aprvl_pdf should be updated on review or not
export const reviewIpRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip_rnwl_id = parseInt(req.params.ipRnwlId);
  const {
    // drm_empno
    aprvl_pdf,
    drm_remarks,
  } = req.body;

  // Check the fields and their types
  if (!ip_rnwl_id || !aprvl_pdf) {
    console.error("Please include all fields".red);
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  try {
    /* Check for a ongoing renewal for ip_id */
    const renewal = await prisma.ipRenewal.findUnique({
      where: { ip_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    if (renewal.status !== IpRenewalRequestStatus.REJECTED_BY_HOD) {
      console.error("".red);
      res.status(403).json({
        message:
          "A renewal request in this stage of the renewal process cannot be reviewed",
      });
      return;
    }

    const reviewedRenewal = await prisma.ipRenewal.update({
      where: { ip_rnwl_id },
      data: {
        aprvl_pdf,
        drm_remarks: drm_remarks ? drm_remarks : "NA",
        rqst_date: new Date(),
        status: IpRenewalRequestStatus.PENDING_APPROVAL,
      },
    });

    if (!reviewedRenewal) {
      console.error("FAILED TO CREATE A RENEWAL".red);
      res
        .status(500)
        .json({ message: "Failed to update the request. Please try again." });
      return;
    }

    res.status(201).json({ ip_rn_id: reviewedRenewal.ip_rnwl_id.toString() });
  } catch (error) {
    console.error("SOMETHING WENT WRONG WHILE CREATING A RENEWAL.".red, error);
    res
      .status(500)
      .json({ message: "Failed to update the reques. Please try again" });
    return;
  }
  res.status(200).send("Working");
};

// @desc Completes a ip renewal
// @route POST /api/renwals/ip/:ipRnwlId/complete
// @access Private
export const completeIpRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip_rnwl_id = parseInt(req.params.ipRnwlId);
  const {
    /* netops_id, */
    new_ip_addrs,
    ip_expiry_date,
    rnwl_pdf,
    netops_remarks,
  } = req.body;

  // Check the fields and their types
  if (!rnwl_pdf || !ip_rnwl_id) {
    console.error("Please include all fields".red);
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  try {
    /* Check for a ongoing renewal for ip_id */
    const renewal = await prisma.ipRenewal.findUnique({
      where: { ip_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    if (renewal.status !== IpRenewalRequestStatus.APPROVED_BY_HOD) {
      console.error("RENEWAL FOR THE ip IS ALREADY IN THE RENEWAL PROCESS".red);
      res.status(403).json({
        message: "Request is either already renewed or not approved by hod.",
      });
      return;
    }

    const completedRenewal = await prisma.ipRenewal.update({
      where: { ip_rnwl_id },
      data: {
        is_rnwd: true,
        rnwl_pdf,
        netops_remarks: netops_remarks ? netops_remarks : "NA",
        rnwl_date: new Date(),
        status: IpRenewalRequestStatus.RENEWED_BY_NETOPS,
      },
    });

    if (!completedRenewal) {
      console.error("FAILED TO COMPLETE RENEWAL".red);
      res
        .status(500)
        .json({ message: "Failed to complete renewal. Please try again." });
      return;
    }

    res
      .status(200)
      .json({ ip_rnwl_id: completedRenewal.ip_rnwl_id.toString() });
  } catch (error) {
    console.error("SOMETHING WENT WRONG WHILE CREATING A RENEWAL.".red, error);
    res
      .status(500)
      .json({ message: "Failed to complete the renewal. Please try again." });
    return;
  }
};

export const getIpRenewal = async (
  req: Request,
  res: Response
): Promise<void> => {
  // const drm_empno = req.user.empno;
  const ip_rnwl_id = parseInt(req.params.ipRnwlId);

  try {
    const renewal = await prisma.ipRenewal.findMany({ where: { ip_rnwl_id } });
    if (!renewal)
      res.status(400).json({ message: "No renewal with the given id found." });
    res.status(200).json(renewal);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching renewal." });
  }
};

export const getIpRenewals = async (
  req: Request,
  res: Response
): Promise<void> => {
  // const drm_empno = req.user.empno;

  try {
    const renewals = await prisma.ipRenewal.findMany();
    res.status(200).json(renewals);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching renewal." });
  }
};
