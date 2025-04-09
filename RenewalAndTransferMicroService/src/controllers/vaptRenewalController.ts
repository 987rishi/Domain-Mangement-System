import { NextFunction, Request, Response } from "express";
import prisma from "../database/prisma";
import dummyDB from "../../dummyDB.json";
import { VaptRenewalRequestStatus } from "@prisma/client";

// @desc Creates a vapt renewal
// @route POST /api/renwals/vapt/create
// @access Private
export const createVaptRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    /* drm_id, */
    vapt_id,
    new_vapt_report,
    new_vapt_expiry_date,
    drm_remarks,
  } = req.body;

  if (!vapt_id || !new_vapt_report || isNaN(parseInt(vapt_id))) {
    console.error("ALL FIELDS ARE NOT PRESENT".red);
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  try {
    /* Check for a ongoing renewal for vapt_id */
    const renewalExists = await prisma.vaptRenewal.findFirst({
      where: {
        vapt_id,
        status: { not: VaptRenewalRequestStatus.APPROVED_BY_HOD },
      },
    });

    if (renewalExists) {
      console.error(
        "RENEWAL FOR THE VAPT IS ALREADY IN THE RENEWAL PROCESS".red
      );
      res.status(403).json({
        message:
          "Renewal for the vapt_id already exists. Another renewal cannot be created.",
      });
      return;
    }

    const count = await prisma.vaptRenewal.count({
      where: {
        vapt_id,
      },
    });

    const rnwl_no = count + 1;
    const newRenewal = await prisma.vaptRenewal.create({
      data: {
        vapt_id,
        new_vapt_report,
        new_vapt_expiry_date,
        drm_remarks: drm_remarks ? drm_remarks : "NA",
        rnwl_no: rnwl_no,
        rqst_date: new Date(),
        // created_by_drm,
        // aprvd_by_hod,
        // rnwd_by_netops,
      },
    });

    if (!newRenewal) {
      console.error("FAILED TO CREATE A RENEWAL".red);
      res
        .status(500)
        .json({ message: "Failed to create a renewal. Please try again." });
      return;
    }

    res.status(201).json({ vapt_rn_id: newRenewal.vapt_rnwl_id.toString() });
  } catch (error) {
    console.error("SOMETHING WENT WRONG WHILE CREATING A RENEWAL.".red, error);
    res
      .status(500)
      .json({ message: "Failed to create a renewal. Please try again." });
    return;
  }
};

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/approve
// @access Private
export const approveVaptRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const vapt_rnwl_id = parseInt(req.params.vaptRnwlId);
  const {
    // hod_empno,
    // vapt_rnwl_id,
    // hod_aprvd, // No need as a request to this route deals with approval
    hod_remarks,
  } = req.body;

  // Check if all fields are present [ and their data types ]
  if (isNaN(vapt_rnwl_id) || /* !hod_aprvd || */ !hod_remarks) {
    console.error(`field validation failed`.red);
    res
      .status(400)
      .json({ message: "Please provid all fields with the correct format." });
    return;
  }

  try {
    // Check if the renewal exists in the database
    const renewal = await prisma.vaptRenewal.findUnique({
      where: { vapt_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    // Check if it is a renewal that has already been approved
    if (renewal.status !== VaptRenewalRequestStatus.PENDING_APPROVAL) {
      console.error(`Requests already been approved`.red);
      res.status(403).json({
        message: `Forbidden Action: Renewal with the given id ${vapt_rnwl_id} has already been approved`,
      });
      return;
    }

    const approvedRenewal = await prisma.vaptRenewal.update({
      where: {
        vapt_rnwl_id,
      },
      data: {
        hod_aprvd: true,
        aprvl_date: new Date(),
        hod_remarks,
        status: VaptRenewalRequestStatus.APPROVED_BY_HOD,
      },
    });

    res
      .status(200)
      .json({ vapt_rnwl_id: approvedRenewal.vapt_rnwl_id.toString() });
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

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/reject
// @access Private
export const rejectVaptRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const vapt_rnwl_id = parseInt(req.params.vaptRnwlId);
  const {
    // hod_empno,
    // vapt_rnwl_id,
    // hod_aprvd, // No need as a request to this route deals with approval
    hod_remarks,
  } = req.body;

  // Check if all fields are present [ and their data types ]
  if (isNaN(vapt_rnwl_id) || /* !hod_aprvd || */ !hod_remarks) {
    console.error(`field validation failed`.red);
    res
      .status(400)
      .json({ message: "Please provide all fields with the correct format." });
    return;
  }

  try {
    // Check if the renewal exists in the database
    const renewal = await prisma.vaptRenewal.findUnique({
      where: { vapt_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    // Check if it is a renewal that has already been approved
    if (renewal.status !== VaptRenewalRequestStatus.PENDING_APPROVAL) {
      console.error(`Requests already been approved/rejected`.red);
      res.status(403).json({
        message: `Forbidden Action: Renewal with the given id ${vapt_rnwl_id} has already been approved/rejected.`,
      });
      return;
    }

    const approvedRenewal = await prisma.vaptRenewal.update({
      where: {
        vapt_rnwl_id,
      },
      data: {
        hod_aprvd: false,
        aprvl_date: new Date(),
        hod_remarks,
        status: VaptRenewalRequestStatus.REJECTED_BY_HOD,
      },
    });

    res
      .status(200)
      .json({ vapt_rnwl_id: approvedRenewal.vapt_rnwl_id.toString() });
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

// @desc Approves a pending vapt renewal
// @route POST /api/renwals/vapt/:vaptRnwlId/review
// @access Private
// TODO Decide new_vapt_report should be updated on review or not
export const reviewVaptRenewal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const vapt_rnwl_id = parseInt(req.params.vaptRnwlId);
  const {
    // drm_empno
    new_vapt_report,
    new_vapt_expiry_date,
    // vapt_rnwl_id,
    drm_remarks,
  } = req.body;

  // Check the fields and their types
  if (!vapt_rnwl_id || !new_vapt_report) {
    console.error("Please include all fields".red);
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  try {
    /* Check for a ongoing renewal for vapt_id */
    const renewal = await prisma.vaptRenewal.findUnique({
      where: { vapt_rnwl_id },
    });
    if (!renewal) {
      console.error(`No renewal with given renewal id`.red);
      res.status(400).json({ message: "Please provide a valid renewal id." });
      return;
    }

    if (renewal.status !== VaptRenewalRequestStatus.REJECTED_BY_HOD) {
      console.error("".red);
      res.status(403).json({
        message:
          "A renewal request in this stage of the renewal process cannot be reviewed",
      });
      return;
    }

    const reviewedRenewal = await prisma.vaptRenewal.update({
      where: { vapt_rnwl_id },
      data: {
        new_vapt_report,
        new_vapt_expiry_date,
        drm_remarks: drm_remarks ? drm_remarks : "NA",
        rqst_date: new Date(),
        status: VaptRenewalRequestStatus.PENDING_APPROVAL,
      },
    });

    if (!reviewedRenewal) {
      console.error("FAILED TO CREATE A RENEWAL".red);
      res
        .status(500)
        .json({ message: "Failed to update the request. Please try again." });
      return;
    }

    res
      .status(201)
      .json({ vapt_rn_id: reviewedRenewal.vapt_rnwl_id.toString() });
  } catch (error) {
    console.error("SOMETHING WENT WRONG WHILE CREATING A RENEWAL.".red, error);
    res
      .status(500)
      .json({ message: "Failed to update the reques. Please try again" });
    return;
  }
  res.status(200).send("Working");
};

export const getVaptRenewal = async (req, res, next): Promise<void> => {
  // const drm_empno = req.user.empno;
  const vapt_rnwl_id = parseInt(req.params.vaptRnwlId);

  try {
    const renewal = await prisma.vaptRenewal.findMany({
      where: { vapt_rnwl_id },
    });
    if (!renewal)
      res.status(400).json({ message: "No renewal with the given id found." });
    res.status(200).json(renewal);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching renewal." });
  }
};

export const getVaptRenewals = async (req, res, next): Promise<void> => {
  // const drm_empno = req.user.empno;

  try {
    const renewals = await prisma.vaptRenewal.findMany();
    res.status(200).json(renewals);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching renewal." });
  }
};
