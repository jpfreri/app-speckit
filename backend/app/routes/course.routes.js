import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], courseController.findAll);

export default router;
