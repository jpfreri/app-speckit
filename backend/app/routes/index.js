import { Router } from "express";
import sectionRoutes from "./section.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import semesterRoutes from "./semester.routes.js";
import courseRoutes from "./course.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/users", userRoutes);
router.use("/", authRoutes);
router.use("/semesters", semesterRoutes);
router.use("/courses", courseRoutes);
router.use("/sections", sectionRoutes);

export default router;
