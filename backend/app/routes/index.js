import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import semesterRoutes from "./semester.routes.js";
const router = Router();

router.use("/users", userRoutes);
router.use("/", authRoutes);
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
router.use("/semesters", semesterRoutes);

// Register feature routers here as you implement them, e.g.:
// import authRoutes from "./auth.routes.js";
// router.use("/", authRoutes);

export default router;
