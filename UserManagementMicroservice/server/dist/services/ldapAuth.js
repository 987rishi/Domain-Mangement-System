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
exports.findUserByIdentifier = exports.authenticateUser = void 0;
const ldapjs_1 = __importDefault(require("ldapjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_config_1 = __importDefault(require("../config/index.config"));
dotenv_1.default.config();
const LDAP_URL = index_config_1.default.ldap.url;
const BIND_DN = index_config_1.default.ldap.bindDN;
const BIND_PASSWORD = index_config_1.default.ldap.bindPassword;
const BASE_DN = index_config_1.default.ldap.searchBase;
// Helper function to convert entry.attributes array to a plain object
const ldapEntryToObject = (entry) => {
    const obj = {};
    for (const attribute of entry.attributes) {
        if (attribute.type && attribute.values && attribute.values.length > 0) {
            obj[attribute.type] = attribute.values[0];
        }
    }
    return obj;
};
const authenticateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const client = ldapjs_1.default.createClient({ url: LDAP_URL });
        client.bind(BIND_DN, BIND_PASSWORD, (err) => {
            if (err)
                return reject(new Error("Admin Bind Failed"));
            const opts = {
                filter: `(mail=${email})`,
                scope: "sub",
                attributes: ["uidNumber", "cn", "mail", "gidNumber"], // don't ask for "dn" here
            };
            client.search(BASE_DN, opts, (err, res) => {
                if (err) {
                    client.unbind();
                    return reject(new Error("LDAP Search Error"));
                }
                let userDn = "";
                let uidNumber = null;
                let fullName = null;
                let employeeEmail = null;
                let employeeCenter = null;
                let gidNumber = null;
                res.on("searchEntry", (entry) => {
                    userDn = entry.dn.toString();
                    console.log("User DN:", userDn);
                    const obj = ldapEntryToObject(entry);
                    uidNumber = obj.uidNumber;
                    fullName = obj.cn;
                    employeeEmail = obj.mail;
                    const centreMatch = userDn.match(/ou=([A-Z]{2}),ou=User/i);
                    employeeCenter = centreMatch ? centreMatch[1].toUpperCase() : null;
                    console.log("UID Number:", uidNumber);
                    console.log("Full Name:", fullName);
                    console.log("Email:", employeeEmail);
                    console.log("Centre:", employeeCenter);
                });
                res.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
                    if (!userDn || !employeeEmail) {
                        client.unbind();
                        return reject(new Error("User not found"));
                    }
                    client.bind(userDn, password, (err) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err) {
                            client.unbind();
                            return reject(new Error("Invalid Credentials"));
                        }
                        console.log("user authenticated");
                        client.unbind();
                        resolve({
                            uidNumber,
                            fullName,
                            employeeEmail,
                            employeeCenter,
                        });
                    }));
                }));
            });
        });
    });
});
exports.authenticateUser = authenticateUser;
// searching a user by uidnumber
const findUserByIdentifier = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const client = ldapjs_1.default.createClient({ url: LDAP_URL });
        // Bind to the LDAP server
        client.bind(BIND_DN, BIND_PASSWORD, (err) => {
            if (err) {
                client.unbind();
                return reject(new Error("Admin Bind Failed"));
            }
            // Define search options
            const opts = {
                filter: `uidNumber=${identifier}`,
                scope: "sub",
                attributes: ["cn", "mail"],
            };
            // Perform the search
            client.search(BASE_DN, opts, (err, res) => {
                if (err) {
                    client.unbind();
                    return reject(new Error("LDAP Search Error"));
                }
                let fullName = null;
                let employeeEmail = null;
                res.on("searchEntry", (entry) => {
                    const obj = ldapEntryToObject(entry);
                    fullName = obj.cn;
                    employeeEmail = obj.mail;
                    console.log("Full Name:", fullName);
                    console.log("email:", employeeEmail);
                });
                res.on("error", (err) => {
                    client.unbind();
                    reject(new Error(`LDAP Search Error: ${err.message}`));
                });
                res.on("end", (result) => {
                    if (!fullName || !employeeEmail) {
                        client.unbind();
                        reject(new Error("User not found"));
                    }
                    else {
                        resolve({
                            employeeEmail,
                            fullName
                        });
                    }
                    client.unbind();
                });
            });
        });
    });
});
exports.findUserByIdentifier = findUserByIdentifier;
