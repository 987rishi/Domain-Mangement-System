import prisma from "../config/database.config";
import { UserInfo } from "../types/webhook.types";
import axios from "axios";

// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Call your User Management Microservice API




export const findUserEmailByEmpNo = async (
  empNo: bigint,
  role:string
): Promise<UserInfo | null> => {
  console.log(`Placeholder: Looking up email for emp_no ${empNo}`);

//  const user = await prisma.user.findUnique({
//    where:{
//     emp_no:empNo
//    }
//  })
//   if (user) {
//     return {
//       emp_no:user.emp_no,
//       email: user.usr_email,
//       fname:user.usr_fname,
//       role:user.role
//     }
//   } else {
//     console.warn(`Placeholder: User ${empNo} not exist.`);
//     return null;
//   }
  // In reality:
  try {
    const response = await axios.get(`http://api/users/details/${role}/${empNo}`);
    if (response.data) {
      return { emp_no: response.data.emp_no, email: response.data.email_id, fname: response.data.fname };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user ${empNo} from User Service:`, error);
    return null;
  }
};
