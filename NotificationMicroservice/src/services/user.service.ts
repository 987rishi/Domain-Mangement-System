import prisma from "../config/database.config";
import { UserInfo } from "../types/webhook.types";

// ---- VERY IMPORTANT PLACEHOLDER ----
// Replace this with actual logic to fetch user details (email)
// Option A: Call your User Management Microservice API
// Option B: Query your shared User database directly (if applicable)

// const MOCK_USER_DB: { [key: number]: UserInfo } = {
//   123: { emp_no: 123, email: "drm_user@example.com", fname: "DRM" },
//   456: { emp_no: 456, email: "arm_user@example.com", fname: "ARM" },
//   789: { emp_no: 789, email: "hod_user@example.com", fname: "HoD" },
//   // Add more mock users as needed
// };

export const findUserEmailByEmpNo = async (
  empNo: bigint
): Promise<UserInfo | null> => {
  console.log(`Placeholder: Looking up email for emp_no ${empNo}`);

 const user = await prisma.user.findUnique({
   where:{
    emp_no:empNo
   }
 })
  if (user) {
    return {
      emp_no:user.emp_no,
      email: user.usr_email,
      fname:user.usr_fname,
      role:user.role
    }
  } else {
    console.warn(`Placeholder: User ${empNo} not exist.`);
    return null;
  }
  // In reality:
  // try {
  //   const response = await axios.get(`http://user-service/api/v1/users/${empNo}/details`);
  //   if (response.data) {
  //     return { emp_no: response.data.emp_no, email: response.data.email_id, fname: response.data.fname };
  //   }
  //   return null;
  // } catch (error) {
  //   console.error(`Error fetching user ${empNo} from User Service:`, error);
  //   return null;
  // }
};
