"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
exports.isValidBigInt = isValidBigInt;
// ---- VERY IMPORTANT PLACEHOLDER ----
// In a real application, this middleware would:
// 1. Verify a JWT token, session cookie, or API key from the request headers/cookies.
// 2. Fetch user details based on the verified token/session.
// 3. Attach user information (especially emp_no) to the request object (e.g., req.user).
// 4. Call next() if authenticated, or send a 401 Unauthorized response if not.
// For this tutorial, we'll simulate attaching a user.
// Replace this with your actual authentication logic (e.g., Passport.js, custom JWT check).
function isValidBigInt(value) {
    try {
        BigInt(value); // Try converting to BigInt
        return true; // If successful, it's valid
    }
    catch (error) {
        return false; // If error occurs, it's not a valid BigInt
    }
}
const authenticate = (req, res, next) => {
    console.log("WARNING: Using placeholder authentication!");
    // Simulate fetching user from a token or session
    // In a real app, decode JWT here or validate session
    const simulatedUserId = BigInt(req.headers["x-user-id"]);
    console.log(`The UserId of person who want notification is ${simulatedUserId}`);
    if (!simulatedUserId) {
        res
            .status(401)
            .json({ message: "Unauthorized: Missing or invalid simulated user ID" });
        return;
    }
    req.user = {
        emp_no: simulatedUserId, // Example: Hardcode or get from a test header
    };
    console.log(`Simulated authentication for user emp_no: ${req.user.emp_no}`);
    next(); // Assume user is authenticated
};
exports.authenticate = authenticate;
