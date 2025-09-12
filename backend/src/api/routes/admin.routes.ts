import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/papers - Get all papers for admin review
router.get("/papers", AdminController.getAllPapers);

// PUT /api/admin/papers/:id/status - Update paper status
router.put("/papers/:id/status", AdminController.updatePaperStatus);

// POST /api/admin/categories - Create new category
router.post("/categories", AdminController.createCategory);

// DELETE /api/admin/categories/:id - Delete category
router.delete("/categories/:id", AdminController.deleteCategory);

export default router;
