    import { NextFunction, Request, Response } from "express";
    import jwt from "jsonwebtoken";

    /**
 * Middleware to handle user authentication based on a JSON Web Token (JWT).
 *
 * @remarks
 * **SECURITY WARNING:** This middleware currently uses `jwt.decode()` which **does not verify the token's signature**.
 * It only decodes the payload, making it vulnerable to tampering. But we are verifying the token in the api-gateway
 * environment for protecting sensitive routes without signature verification.
 * For a secure implementation, replace `jwt.decode()` with `jwt.verify()` and provide the appropriate secret or public key.
 *
 * If the token is decoded, its payload is attached to the `req.user` object, making it available
 * to subsequent route handlers.
 *
 * @param req - The Express request object. It is expected to contain an `Authorization` header in the format "Bearer <token>".
 * @param res - The Express response object, used to send an error response if authentication fails.
 * @param next - The next middleware function in the stack.
 * @returns Does not return a value but either sends an HTTP response or passes control to the next middleware.
 *
 * @example
 * ```
 * // Protecting a user-specific route
 * router.get('/my-profile', authMiddleware, (req, res) => {
 *   // req.user is now available here
 *   res.json({ user: req.user });
 * });
 * ```
 */
    export const authMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction
    ): void => {
      console.log("Verifying right person")
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
