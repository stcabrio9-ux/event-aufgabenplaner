import { Router } from "express";
import * as controller from "../controllers/resources.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../schemas.js";
import { requireRole } from "../services/auth.js";

const router = Router();
const id = validate(schemas.idParams, "params");

router.patch("/tasks/:id", id, validate(schemas.taskUpdate), asyncHandler(controller.taskUpdate));
router.delete("/tasks/:id", requireRole("admin"), id, asyncHandler(controller.taskDelete));
router.delete("/members/:id", requireRole("admin"), id, asyncHandler(controller.memberDelete));
router.delete("/costs/:id", requireRole("admin"), id, asyncHandler(controller.costDelete));
router.patch("/costs/:id", requireRole("admin"), id, validate(schemas.costUpdate), asyncHandler(controller.costUpdate));
router.get("/people", asyncHandler(controller.peopleList));
router.post("/people", requireRole("admin"), validate(schemas.personCreate), asyncHandler(controller.personCreate));
router.patch("/people/:id", requireRole("admin"), id, validate(schemas.personUpdate), asyncHandler(controller.personUpdate));
router.delete("/people/:id", requireRole("admin"), id, asyncHandler(controller.personDelete));
router.get("/teams", asyncHandler(controller.teamList));
router.post("/teams", requireRole("admin"), validate(schemas.teamCreate), asyncHandler(controller.teamCreate));
router.patch("/teams/:id", requireRole("admin"), id, validate(schemas.teamUpdate), asyncHandler(controller.teamUpdate));
router.delete("/teams/:id", requireRole("admin"), id, asyncHandler(controller.teamDelete));

export default router;
