import { NextFunction, Request, Response } from "express";

function logger(req: Request, res: Response, next: NextFunction) {
    let log = `${req.method} ${req.protocol}:${req.host}${req.originalUrl}`;
    switch (req.method) {
        case "GET":
            log = log.green
            break;
        case "POST":
            log = log.yellow
            break;
        case "PUT":
            log = log.blue
            break;
        case "DELETE":
            log = log.red;
        default:
            log = log.white;
            break;
    }
    console.log(log)
    next();
}

export default logger;