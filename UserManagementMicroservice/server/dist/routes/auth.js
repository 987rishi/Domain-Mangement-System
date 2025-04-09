var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { authenticateUser } from "../services/ldapAuth.js";
const router = express.Router();
// interface User {
//   userDn:string,
//   employeeNumber:string,
//   employeeName:string,
//   employeeEmail:string,
//   employeeCenter:string
// }
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
    }
    try {
        const user = yield authenticateUser(email, password);
        res.json(user);
        return;
    }
    catch (error) {
        res.status(401).json({ message: error.message });
        return;
    }
}));
export default router;
