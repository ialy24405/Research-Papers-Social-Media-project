import { Request, Response } from "express";
import { CategoryModel } from "../models/category.model";
import { categorySchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";

export class CategoryController {
	static async getAllCategories(req: Request, res: Response) {
		try {
			const categories = await CategoryModel.findAll();

			const response = categories.map((category) => ({
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Get categories error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async getCategoryById(req: Request, res: Response) {
		try {
			const categoryId = req.params.id;
			const category = await CategoryModel.findById(categoryId);

			if (!category) {
				return res.status(404).json({ error: "Category not found" });
			}

			const response = {
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
			};

			res.status(200).json(response);
		} catch (error) {
			console.error("Get category by ID error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async createCategory(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Validate request body
			const { error, value } = categorySchema.validate(req.body);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			const { id, name, description, imageUrl, imageHint } = value;

			// Check if category already exists
			const existingCategory = await CategoryModel.findById(id);
			if (existingCategory) {
				return res.status(409).json({ error: "Category ID already exists" });
			}

			const categoryData = {
				id,
				name,
				description,
				imageUrl,
				imageHint,
			};

			const category = await CategoryModel.create(categoryData);

			const response = {
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
			};

			res.status(201).json(response);
		} catch (error) {
			console.error("Create category error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async deleteCategory(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const categoryId = req.params.id;
			const category = await CategoryModel.findById(categoryId);

			if (!category) {
				return res.status(404).json({ error: "Category not found" });
			}

			await CategoryModel.delete(categoryId);

			res.status(200).json({ message: "Category deleted." });
		} catch (error) {
			console.error("Delete category error:", error);
			if ((error as any).code === "23503") {
				// Foreign key constraint violation
				res
					.status(400)
					.json({ error: "Cannot delete category that has associated papers" });
			} else {
				res.status(500).json({ error: "Internal server error" });
			}
		}
	}
}
