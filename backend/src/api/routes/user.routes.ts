import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET /api/users/me/papers - Get current user's papers
router.get("/me/papers", authMiddleware, UserController.getUserPapers);

// GET /api/users/me/saved-papers - Get current user's saved papers
router.get("/me/saved-papers", authMiddleware, UserController.getSavedPapers);

export default router;
