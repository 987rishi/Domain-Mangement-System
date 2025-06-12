// src/middlewares/contextMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { requestContext } from "../context/requestContext";

export function contextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Extract user_id from the request, assuming authMiddleware has already run
  // The 'user' object on 'req' is a common pattern after authentication.
  const userId = req.user?.email;

  // Create a context for this request
  const store = {
    correlationId:
      req.user?.email ||
      (req.headers["x-correlation-id"] as string) ||
      randomUUID(),
    userId: userId,
  };

  // Run the rest of the request chain in the context of this store
  requestContext.run(store, () => {
    next();
  });
}
