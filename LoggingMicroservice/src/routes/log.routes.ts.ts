import { Router } from "express";
import { createLogEntry, getLogEntries } from "../controllers/log.controller";

const router = Router();

router.post("/", createLogEntry);
router.get("/", getLogEntries);

export default router;
