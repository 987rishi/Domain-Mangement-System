import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized User" });
    return;
  }
  const token = authHeader.split(" ")[1];
  const payload = jwt.decode(token);
  console.log(token);
  console.log(payload);
  if (!payload) {
    res.status(400).json({ message: "Invalid token payload" });
    return;
  }
  req.user = payload;
  next();
};
