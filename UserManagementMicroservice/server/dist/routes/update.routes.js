"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updateController_controller_1 = require("../controllers/updateController.controller");
const router = (0, express_1.Router)();
// PATCH: /api/update/users/:empNo
router.patch("/:empNo", updateController_controller_1.updateController);
exports.default = router;
