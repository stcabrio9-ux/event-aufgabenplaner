import { Router } from "express";
import * as controller from "../controllers/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authUser } from "../services/auth.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../schemas.js";

const router = Router();

router.post("/login", validate(schemas.authLogin), asyncHandler(controller.login));
router.get("/me", authUser, asyncHandler(controller.me));
router.post("/logout", authUser, asyncHandler(controller.logout));

export default router;
