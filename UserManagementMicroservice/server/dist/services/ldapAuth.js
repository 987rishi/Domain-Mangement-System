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
exports.generateToken = exports.findUserByIdentifier = exports.authenticateUser = void 0;
const ldapjs_1 = __importDefault(require("ldapjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_config_1 = __importDefault(require("../config/index.config"));
const userController_helper_1 = require("../utils/userController.helper");
dotenv_1.default.config();
const LDAP_URL = index_config_1.default.ldap.url;
const BIND_DN = index_config_1.default.ldap.bindDN;
const BIND_PASSWORD = index_config_1.default.ldap.bindPassword;
const BASE_DN = index_config_1.default.ldap.searchBase;
// Helper function to convert an LDAP entry's attributes array to a plain object
/**
 * Converts an LDAP entry's attributes array to a plain object of type Partial<MyUser>.
 *
 * The function iterates over each attribute in the entry's attributes array and checks
 * if the attribute has a valid type and non-empty values array. If so, it maps the
 * attribute's type to a key in the MyUser interface and stores the first value from the
 * attribute's values array in the object.
 *
 * @param {SearchEntry} entry - The LDAP entry whose attributes should be converted to an object
 * @returns {Partial<MyUser>} - An object with attributes mapped to MyUser keys
 */
const ldapEntryToObject = (entry) => {
    // Initialize an empty object of type Partial<MyUser> to store converted attributes
    const obj = {};
    // Iterate over each attribute in the entry's attributes array
    for (const attribute of entry.attributes) {
        // Check if the attribute has a valid type and non-empty values array
        if (attribute.type && attribute.values && attribute.values.length > 0) {
            // Map the attribute's type to a key in the MyUser interface
            // Store the first value from the attribute's values array in the object
            obj[attribute.type] = attribute.values[0];
        }
    }
    // Return the constructed object with attributes mapped to MyUser keys
    return obj;
};
/**
 * Authenticates a user against an LDAP directory using their email and password.
 *
 * This function binds to the LDAP server using admin credentials to search for
 * a user by their email address. If a user is found, their Distinguished Name
 * (DN) and other attributes are retrieved. The user's credentials are then
 * verified by attempting to bind again using their DN and the provided password.
 *
 * If authentication is successful, the user's role and group information are
 * also retrieved and returned.
 *
 * @param {string} email - The email address of the user to authenticate.
 * @param {string} password - The password of the user to authenticate.
 * @returns {Promise<Object>} - A promise that resolves to an object containing
 * the user's ID, full name, email, center, role, and group if authentication
 * is successful. The promise is rejected with an error message if authentication
 * fails or if any required information is not found.
 *
 * @throws {Object} If there are issues with binding to the LDAP server, searching
 * for the user, or verifying the user's credentials.
 */
const authenticateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        // Create an LDAP client connected to the LDAP server
        const client = ldapjs_1.default.createClient({ url: LDAP_URL });
        // Bind to the LDAP server using the admin DN and password
        // This allows us to perform a search for the user with the specified email
        client.bind(BIND_DN, BIND_PASSWORD, (err) => {
            if (err) {
                // If the bind fails, unbind the client and reject the promise with an
                // error object
                client.unbind();
                return reject({ message: "Admin Bind Failed" });
            }
            // Define search options for the LDAP search
            const opts = {
                // The filter to use for the search. In this case, we're searching for
                // the user whose email address matches the email passed to the function
                filter: `(mail=${email})`,
                // The scope of the search. In this case, we're performing a subtree
                // search, which means that we'll search all entries in the subtree
                // rooted at the base DN.
                scope: "sub",
                // The attributes to return in the search results. In this case, we're
                // asking for the user's common name (cn), email address (mail), and
                // group ID number (gidNumber).
                attributes: ["uidNumber", "cn", "mail", "gidNumber"], // don't ask for "dn" here
            };
            // Perform the search
            client.search(BASE_DN, opts, (err, res) => {
                if (err) {
                    // If the search fails, unbind the client and reject the promise with an
                    // error object
                    client.unbind();
                    return reject({ message: "LDAP Search Error" });
                }
                // Initialize variables to store the user's DN, uidNumber, full name,
                // email address, and centre
                let userDn = "";
                let uidNumber = null;
                let fullName = null;
                let employeeEmail = null;
                let employeeCenter = null;
                // Set up event listeners for the search results. We're interested in the
                // searchEntry event, which is fired for each entry in the search results.
                res.on("searchEntry", (entry) => {
                    userDn = entry.dn.toString();
                    console.log("User DN:", userDn);
                    // Convert the entry's attributes array to a plain object with attributes
                    // mapped to keys in the MyUser interface
                    const obj = ldapEntryToObject(entry);
                    // Store the user's uidNumber, full name, email address, and group ID number
                    // in the variables initialized above
                    uidNumber = obj.uidNumber;
                    fullName = obj.cn;
                    employeeEmail = obj.mail;
                    // Extract the user's centre from the user's DN
                    const centreMatch = userDn.match(/ou=([A-Z]{2}),ou=User/i);
                    employeeCenter = centreMatch ? centreMatch[1].toUpperCase() : null;
                    console.log("UID Number:", uidNumber);
                    console.log("Full Name:", fullName);
                    console.log("Email:", employeeEmail);
                    console.log("Centre:", employeeCenter);
                });
                // When the search is complete, unbind the client and check if the user
                // was found
                res.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
                    if (!userDn || !employeeEmail) {
                        client.unbind();
                        return reject({ message: "User Not Found" });
                    }
                    // Bind to the LDAP server again using the user's DN and password
                    // This allows us to verify the user's credentials
                    client.bind(userDn, password, (err) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err) {
                            client.unbind();
                            return reject({ message: "Invalid Credentials" });
                        }
                        console.log("user authenticated");
                        // Unbind the client
                        client.unbind();
                        // Get the user's role
                        const role = yield (0, userController_helper_1.getUserRole)(uidNumber);
                        // Get the user's group
                        const employeeGroup = yield (0, userController_helper_1.getUserGroupByRole)(uidNumber, role);
                        // Resolve the promise with the user's info
                        resolve({
                            id: Number(uidNumber),
                            name: fullName,
                            employeeEmail,
                            employeeCenter,
                            role,
                            employeeGroup
                        });
                    }));
                }));
            });
        });
    });
});
exports.authenticateUser = authenticateUser;
/**
 * Finds a user by their unique identifier (uidNumber) in the LDAP directory.
 *
 * This function connects to the LDAP server and performs a search query to
 * locate a user whose uidNumber matches the provided identifier. If a user
 * is found, their full name and email address are returned.
 *
 * @param {number} identifier - The unique identifier (uidNumber) of the user to search for.
 * @returns {Promise<{employeeEmail: string, fullName: string}>} - A promise resolving to an object
 * containing the user's email address and full name. If no user is found, the promise is rejected.
 *
 * @throws {Error} If there are issues with binding to the LDAP server or performing the search.
 */
const findUserByIdentifier = (identifier) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const client = ldapjs_1.default.createClient({ url: LDAP_URL });
        // Bind to the LDAP server using the admin DN and password.
        // This is done to ensure that the search is performed with the necessary
        // permissions.
        client.bind(BIND_DN, BIND_PASSWORD, (err) => {
            if (err) {
                // If the bind fails, unbind the client and reject the promise with an
                // error object.
                client.unbind();
                return reject(new Error("Admin Bind Failed"));
            }
            // Define search options
            const opts = {
                // The filter to use for the search. In this case, we're searching for
                // the user whose uidnumber matches the parameter passed to the function.
                filter: `uidNumber=${identifier}`,
                // The scope of the search. In this case, we're performing a subtree
                // search, which means that we'll search all entries in the subtree
                // rooted at the base DN.
                scope: "sub",
                // The attributes to return in the search results. In this case, we're
                // asking for the user's common name (cn) and email address (mail).
                attributes: ["cn", "mail"],
            };
            // Perform the search
            client.search(BASE_DN, opts, (err, res) => {
                if (err) {
                    // If the search fails, unbind the client and reject the promise with an
                    // error object.
                    client.unbind();
                    return reject(new Error("LDAP Search Error"));
                }
                // Initialize variables to store the user's full name and email address.
                let fullName = null;
                let employeeEmail = null;
                // Set up event listeners for the search results. We're interested in the
                // searchEntry event, which is fired for each entry in the search results.
                res.on("searchEntry", (entry) => {
                    const obj = ldapEntryToObject(entry);
                    fullName = obj.cn;
                    employeeEmail = obj.mail;
                    console.log("Full Name:", fullName);
                    console.log("email:", employeeEmail);
                });
                // Set up an event listener for the error event. If an error occurs, we'll
                // unbind the client and reject the promise with an error object.
                res.on("error", (err) => {
                    client.unbind();
                    reject(new Error(`LDAP Search Error: ${err.message}`));
                });
                // Set up an event listener for the end event, which is fired when the
                // search is complete. If the search was successful, we'll resolve the
                // promise with an object containing the user's full name and email address.
                // If the search failed, we'll reject the promise with an error object.
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
/**
* Helper function to generate token given id
* This function takes in the id, email and role of the user and returns a JSON Web Token (JWT)
* The JWT is signed with a secret key, which is stored in the environment variable JWT_SECRET
* The secret key is expected to be a base64 encoded string
* The function returns a promise that resolves to the JWT
* The JWT is valid for 1 day
*/
const generateToken = (id, email, role) => {
    // Get the secret key from the environment variable
    const base64Secret = index_config_1.default.jwt.secret;
    // Convert the base64 encoded secret key to a Buffer
    const secret = Buffer.from(base64Secret, "base64");
    // Create the payload for the JWT
    // The payload contains the id, email and role of the user
    const payload = {
        id,
        email,
        role
    };
    // Sign the payload with the secret key and return the JWT
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "1d" });
    // Log the JWT to the console
    console.log("token:", token);
    // Return the JWT
    return token;
};
exports.generateToken = generateToken;
