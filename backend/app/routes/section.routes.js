import { Router } from "express";
import sectionController from "../controllers/section.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", [authenticate], sectionController.findAll);
router.post("/", [authenticate, requireAdmin], sectionController.create);
router.put("/:sectionId", [authenticate, requireAdmin], sectionController.update);
router.delete("/:sectionId", [authenticate, requireAdmin], sectionController.remove);

export default router;