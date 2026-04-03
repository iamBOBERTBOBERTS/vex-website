import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAnyAuthenticatedRole } from "../middleware/requireRole.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "@vex/shared";
import * as authController from "../controllers/authController.js";

export const authRouter: Router = Router();

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshTokenSchema), authController.refresh);
authRouter.post("/logout", requireAuth, requireAnyAuthenticatedRole(), authController.logout);
authRouter.get("/me", requireAuth, requireAnyAuthenticatedRole(), authController.me);
authRouter.post("/onboarding/complete", requireAuth, requireAnyAuthenticatedRole(), authController.completeOnboarding);
