import express from "express";
import { authenticateUser } from "../services/ldapAuth.js";
import { generateToken } from "../services/ldapAuth.js";
const router = express.Router();

/**
 * @route POST /api/auth/login
 * @description Authenticate user and return a JWT token and user details upon successful login.
 * @description Authenticate using LDAP
 * @param {Object} req - Express request object containing email and password in the body.
 * @param {Object} res - Express response object to send the response.
 * @returns {void}
 */
router.post("/login", async (req, res):Promise<void> => {
  const { email, password } = req.body;
  console.log(email,password)
  console.log(req.body);

  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return; 
  }

  try {
    //calling helper function for ldap authentication
    const user = await authenticateUser(email, password);
    const response = {
      success: true,
      message: "Login Success",
    
      //calling helper function for generating jwt tokens
      token: generateToken(user.id, email, user.role),
      user: user,
    };
    res.status(200).json(response);
    return;
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
    return 
  }
});

export default router;
