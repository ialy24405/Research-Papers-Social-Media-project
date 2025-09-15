import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET /api/users/me - Get current user profile
router.get("/me", authMiddleware, UserController.getCurrentUser);

// GET /api/users/me/papers - Get current user's papers
router.get("/me/papers", authMiddleware, UserController.getUserPapers);

// GET /api/users/me/saved-papers - Get current user's saved papers
router.get("/me/saved-papers", authMiddleware, UserController.getSavedPapers);

// GET /api/users/me/interactions - Get current user's recent interactions
router.get(
	"/me/interactions",
	authMiddleware,
	UserController.getRecentInteractions
);

// PUT /api/users/me - Update current user's profile
router.put("/me", authMiddleware, UserController.updateProfile);

export default router;
