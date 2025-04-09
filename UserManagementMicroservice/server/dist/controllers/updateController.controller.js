"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateController = void 0;
const database_config_1 = __importDefault(require("../config/database.config"));
const updateController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { empNo } = req.params;
    const { designation, tele_no, mob_no } = req.body;
    if (!designation || !tele_no || !mob_no) {
        res.status(400).json({ message: "Missing required fields." });
        return;
    }
    try {
        const updateUser = yield database_config_1.default.appUser.findUnique({
            where: { emp_no: BigInt(empNo),
            }
        });
        if (!updateUser) {
            res.status(404).json({ message: `User not found for employee number ${empNo}.` });
            console.log(`User not found for employee number ${empNo}.`);
            return;
        }
        if (updateUser.role === "DRM") {
            yield database_config_1.default.drm.update({
                where: { emp_no: BigInt(empNo) },
                data: {
                    desig: designation,
                    tele_no,
                    mob_no,
                },
            });
            res.status(200).json({ message: `DRM details updated successfully for employee number ${empNo}.` });
            console.log(`DRM details updated successfully for employee number ${empNo}.`);
            return;
        }
        else if (updateUser.role === "ARM") {
            yield database_config_1.default.arm.update({
                where: { emp_no: BigInt(empNo) },
                data: {
                    desig: designation,
                    tele_no,
                    mob_no,
                },
            });
            res.status(200).json({ message: `ARM details updated successfully for employee number ${empNo}.` });
            console.log(`ARM details updated successfully for employee number ${empNo}.`);
            return;
        }
        else {
            res.status(404).json({ message: `No DRM and ARM found for employee number ${empNo}.` });
            console.log(`No DRM and ARM found for employee number ${empNo}.`);
            return;
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
});
exports.updateController = updateController;
