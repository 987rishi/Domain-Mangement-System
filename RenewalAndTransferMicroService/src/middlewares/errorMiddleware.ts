import { Request, NextFunction, Response } from "express";
import { AppError } from "../errors";

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    error: err,
    // stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
  return next();
};

export default errorHandler;
