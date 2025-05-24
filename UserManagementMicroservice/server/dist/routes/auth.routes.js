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
const express_1 = __importDefault(require("express"));
const ldapAuth_js_1 = require("../services/ldapAuth.js");
const ldapAuth_js_2 = require("../services/ldapAuth.js");
const router = express_1.default.Router();
/**
 * @route POST /api/auth/login
 * @description Authenticate user and return a JWT token and user details upon successful login.
 * @description Authenticate using LDAP
 * @param {Object} req - Express request object containing email and password in the body.
 * @param {Object} res - Express response object to send the response.
 * @returns {void}
 */
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(email, password);
    console.log(req.body);
    if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
    }
    try {
        //calling helper function for ldap authentication
        const user = yield (0, ldapAuth_js_1.authenticateUser)(email, password);
        const response = {
            success: true,
            message: "Login Success",
            //calling helper function for generating jwt tokens
            token: (0, ldapAuth_js_2.generateToken)(user.id, email, user.role),
            user: user,
        };
        res.status(200).json(response);
        return;
    }
    catch (error) {
        res.status(401).json({ message: error.message });
        return;
    }
}));
exports.default = router;
