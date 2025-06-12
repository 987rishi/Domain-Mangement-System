"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logger(req, res, next) {
    let log = `${req.method} ${req.protocol}:${req.host}${req.originalUrl}`;
    switch (req.method) {
        case "GET":
            log = log.green;
            break;
        case "POST":
            log = log.yellow;
            break;
        case "PUT":
            log = log.blue;
            break;
        case "DELETE":
            log = log.red;
        default:
            log = log.white;
            break;
    }
    console.log(log);
    next();
}
exports.default = logger;
