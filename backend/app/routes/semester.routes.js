import { Router } from "express";
import semesterController from "../controllers/semester.controller.js";
import { authenticate, authenticateAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], semesterController.findAll);
router.post("/", [authenticateAdmin], semesterController.create);

export default router;
