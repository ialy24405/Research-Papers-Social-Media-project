import express from "express";
import { ReactionController } from "../controllers/reaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Routes that require authentication
router.post("/toggle", authMiddleware, ReactionController.toggleReaction);
router.get(
	"/user/:paperId",
	authMiddleware,
	ReactionController.getUserReaction
);
router.post(
	"/user/bulk",
	authMiddleware,
	ReactionController.getBulkUserReactions
);

// Public routes (don't require authentication)
router.get("/stats/:paperId", ReactionController.getReactionStats);

// Get reaction statistics for multiple papers (public)
router.post("/stats/bulk", ReactionController.getBulkReactionStats);

// Get all reactions for a paper with user details (public)
router.get(
	"/paper/:paperId/details",
	ReactionController.getPaperReactionDetails
);

// Get trending papers based on reactions
router.get("/trending", ReactionController.getTrendingPapers);

export default router;
