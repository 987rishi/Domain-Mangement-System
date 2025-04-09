import { NextFunction, Request } from "express";

async function protect(req: Request, res: Response, next: NextFunction) {
    // ! Implement authentication middleware
    req.headers.auth
}