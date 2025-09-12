import { Response } from "express";
import { PaperModel } from "../models/paper.model";
import { CategoryModel } from "../models/category.model";
import { paperStatusSchema, categorySchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";

export class AdminController {
	static async getAllPapers(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const status = (req.query?.status as string) || "pending";
			const papers = await PaperModel.findAll({ status });

			const response = papers.map((paper) => ({
				id: paper.id,
				title: paper.title,
				authorName: paper.author_name,
				status: paper.status,
				createdAt: paper.created_at,
				rejectionReason: paper.rejection_reason,
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Admin get papers error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async updatePaperStatus(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const paperId = parseInt(req.params?.id as string);

			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			// Validate request body
			const { error, value } = paperStatusSchema.validate(req.body);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			const { status, reason } = value;

			// Check if paper exists
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Update paper status
			await PaperModel.updateStatus(paperId, status, req.user.id, reason);

			res.status(200).json({ message: "Paper status updated." });
		} catch (error) {
			console.error("Update paper status error:", error);
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
			console.error("Admin create category error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async deleteCategory(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const categoryId = req.params?.id as string;
			const category = await CategoryModel.findById(categoryId);

			if (!category) {
				return res.status(404).json({ error: "Category not found" });
			}

			await CategoryModel.delete(categoryId);

			res.status(200).json({ message: "Category deleted." });
		} catch (error) {
			console.error("Admin delete category error:", error);
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
