import { Router } from "express";
import * as controller from "../controllers/resources.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../schemas.js";

const router = Router();
const id = validate(schemas.idParams, "params");

router.patch("/tasks/:id", id, validate(schemas.taskUpdate), asyncHandler(controller.taskUpdate));
router.delete("/tasks/:id", id, asyncHandler(controller.taskDelete));
router.delete("/members/:id", id, asyncHandler(controller.memberDelete));
router.delete("/costs/:id", id, asyncHandler(controller.costDelete));
router.patch("/costs/:id", id, validate(schemas.costUpdate), asyncHandler(controller.costUpdate));

export default router;
