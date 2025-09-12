import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();

// GET /api/categories - Get all categories
router.get("/", CategoryController.getAllCategories);

// GET /api/categories/:id - Get single category by ID
router.get("/:id", CategoryController.getCategoryById);

export default router;
