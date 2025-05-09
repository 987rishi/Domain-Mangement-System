"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
/**
 * This module creates a Prisma Client instance which is used to interact
 * with the database. The instance is configured to log all queries and
 * any errors that occur while interacting with the database. The log
 * messages are formatted in a human-readable format.
 *
 * The Prisma Client instance is then exported as the default export of
 * this module, making it available to other parts of the application.
 */
const prisma = new client_1.PrismaClient({
    log: ["error", "query"],
    errorFormat: "pretty",
});
exports.default = prisma;
