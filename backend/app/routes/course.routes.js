import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], courseController.findAll);
router.post("/", [authenticateAdmin], courseController.create);
router.put("/:courseId", [authenticateAdmin], courseController.update);
router.delete("/:courseId", [authenticateAdmin], courseController.remove);

export default router;
