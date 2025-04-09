import {Router} from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js"
import assignRoutes from "./assign.routes.js";
import updateRoutes from "./update.routes.js"
const mainRouter = Router();

mainRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});
// provide the login routes
mainRouter.use("/api/auth", authRoutes);
// provide the user details routes
mainRouter.use("/api/users",userRoutes);
// DRM and ARM assignment Routes
mainRouter.use("/api/projects",assignRoutes);
// Update user details Routes
mainRouter.use("/api/update/users",updateRoutes)
export default mainRouter;