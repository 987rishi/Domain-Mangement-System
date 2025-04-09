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
//POST: /api/auth/login
router.post("/login", async (req, res):Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return; 
  }

  try {
    const user = await authenticateUser(email, password);
     res.json(user);
     return;
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
    return 
  }
});

export default router;
