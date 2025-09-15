import { Router } from "express";
import { PaperController } from "../controllers/paper.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// GET /api/papers - Get all papers with filters
router.get("/", PaperController.getAllPapers);

// POST /api/papers/upload - Upload a new paper (protected)
router.post(
	"/upload",
	authMiddleware,
	PaperController.uploadMiddleware,
	PaperController.uploadPaper
);

// GET /api/papers/:id - Get single paper by ID
router.get("/:id", PaperController.getPaperById);

// POST /api/papers/:id/save - Save a paper (protected)
router.post("/:id/save", authMiddleware, PaperController.savePaper);

// DELETE /api/papers/:id/save - Unsave a paper (protected)
router.delete("/:id/save", authMiddleware, PaperController.unsavePaper);

// POST /api/papers/:id/comment - Add comment to a paper (protected)
router.post("/:id/comment", authMiddleware, PaperController.addComment);

// GET /api/papers/:id/comments - Get comments for a paper
router.get("/:id/comments", PaperController.getComments);

export default router;
