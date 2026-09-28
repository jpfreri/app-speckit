import { Router } from "express";
import authRoutes from "./auth.routes.js";
const router = Router();


router.use("/", authRoutes);
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Register feature routers here as you implement them, e.g.:
// import authRoutes from "./auth.routes.js";
// router.use("/", authRoutes);

export default router;
