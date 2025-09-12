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

export default router;
