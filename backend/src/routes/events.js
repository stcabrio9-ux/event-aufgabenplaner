import { Router } from "express";
import * as controller from "../controllers/events.js";
import * as resources from "../controllers/resources.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../schemas.js";

const router = Router();
const id = validate(schemas.idParams, "params");
const eventId = validate(schemas.eventIdParams, "params");

router.get("/", asyncHandler(controller.list));
router.post("/", validate(schemas.eventCreate), asyncHandler(controller.create));
router.get("/:id", id, asyncHandler(controller.get));
router.patch("/:id", id, validate(schemas.eventUpdate), asyncHandler(controller.update));
router.delete("/:id", id, asyncHandler(controller.remove));

router.get("/:eventId/tasks", eventId, asyncHandler(resources.taskList));
router.post("/:eventId/tasks", eventId, validate(schemas.taskCreate), asyncHandler(resources.taskCreate));
router.get("/:eventId/members", eventId, asyncHandler(resources.memberList));
router.post("/:eventId/members", eventId, validate(schemas.memberCreate), asyncHandler(resources.memberCreate));
router.get("/:eventId/costs", eventId, asyncHandler(resources.costList));
router.post("/:eventId/costs", eventId, validate(schemas.costCreate), asyncHandler(resources.costCreate));
router.get("/:eventId/comments", eventId, asyncHandler(resources.commentList));
router.post("/:eventId/comments", eventId, validate(schemas.commentCreate), asyncHandler(resources.commentCreate));

export default router;
