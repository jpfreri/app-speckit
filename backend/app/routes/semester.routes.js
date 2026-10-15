import { Router } from "express";
import semesterController from "../controllers/semester.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], semesterController.findAll);

export default router;
