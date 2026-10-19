import { Router } from "express";
import enrollmentController from "../controllers/enrollment.controller.js";
import { authenticate, requireStudent } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate, requireStudent], enrollmentController.findAll);
router.post("/", [authenticate, requireStudent], enrollmentController.create);

export default router;