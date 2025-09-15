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

// Category management routes
// GET /api/admin/categories - Get all categories
router.get("/categories", AdminController.getAllCategories);

// POST /api/admin/categories - Create new category
router.post("/categories", AdminController.createCategory);

// PUT /api/admin/categories/:id - Update category
router.put("/categories/:id", AdminController.updateCategory);

// DELETE /api/admin/categories/:id - Delete category
router.delete("/categories/:id", AdminController.deleteCategory);

// User management routes
// GET /api/admin/users - Get all users with optional filters
router.get("/users", AdminController.getAllUsers);

// PUT /api/admin/users/:id/role - Update user role
router.put("/users/:id/role", AdminController.updateUserRole);

// PUT /api/admin/users/:id - Update user details
router.put("/users/:id", AdminController.updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", AdminController.deleteUser);

// GET /api/admin/insights - Get admin dashboard insights
router.get("/insights", AdminController.getInsights);

export default router;
