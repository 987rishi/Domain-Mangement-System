import { RequestHandler } from "express";
import LogEntry from "../models/logEntry.model";

import {
  createLogEntrySchema,
  getLogsQuerySchema,
} from "../validators/log.validator";

import { ZodError } from "zod";

export const createLogEntry: RequestHandler = async (req, res, next) => {
  try {
    // Validate incoming data
    const validatedData = createLogEntrySchema.parse(req.body);

    // Prepare data for Mongoose model
    const logPayload: any = { ...validatedData };
    if (validatedData.timestamp) {
      logPayload.timestamp = new Date(validatedData.timestamp);
    }

    const logEntry = new LogEntry(logPayload);
    await logEntry.save();
    res
      .status(201)
      .json({ message: "Log entry created successfully", data: logEntry });
  } catch (error: any) {
    if (error instanceof ZodError) {
      // For ZodErrors (client-side validation errors), send a 400 response directly
      res
        .status(400)
        .json({ message: "Validation failed", errors: error.errors });
    } else {
      console.error("Error creating log entry:", error);
      next(error);
    }
  }
};

export const getLogEntries: RequestHandler = async (req, res, next) => {
  try {
    const validatedQuery = getLogsQuerySchema.parse(req.query);
    const {
      level,
      service_name,
      instance_id,
      correlation_id,
      user_id,
      startDate,
      endDate,
      message,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validatedQuery;

    const query: any = {};
    if (level) query.level = level;
    if (service_name) query.service_name = service_name;
    if (instance_id) query.instance_id = instance_id;
    if (correlation_id) query.correlation_id = correlation_id;
    if (user_id) query.user_id = user_id;
    if (message) query.message = { $regex: message, $options: "i" };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["timestamp"] = -1; // Default sort
    }

    const skip = (page - 1) * limit;

    const logEntries = await LogEntry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalDocuments = await LogEntry.countDocuments(query);

    res.status(200).json({
      data: logEntries,
      totalPages: Math.ceil(totalDocuments / limit),
      currentPage: page,
      totalDocuments,
      limit,
      sortBy,
      sortOrder,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      // For ZodErrors (client-side validation errors on query params), send a 400
      res.status(400).json({
        message: "Validation failed for query parameters",
        errors: error.errors,
      });
    } else {
      // For other errors, pass them to the global error handler
      console.error("Error fetching log entries:", error);
      next(error);
    }
  }
};
