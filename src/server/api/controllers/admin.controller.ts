import { Response } from "express";
import { PaperModel } from "../models/paper.model";
import { CategoryModel } from "../models/category.model";
import { UserModel } from "../models/user.model";
import {
	paperStatusSchema,
	categorySchema,
	categoryUpdateSchema,
} from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";
import { db } from "../../config/db";

export class AdminController {
	static async getAllPapers(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Support filtering by status (all, approved, pending, rejected)
			const status = req.query?.status as string;
			const search = req.query?.search as string;
			const filters: any = {};

			if (status && status !== "all") {
				filters.status = status;
			}

			if (search && search.trim()) {
				filters.search = search.trim();
			}

			const papers = await PaperModel.findAll(filters);

			const response = papers.map((paper) => ({
				id: paper.id,
				title: paper.title,
				name: paper.title,
				description: paper.description,
				authorId: paper.author_id,
				authorName: paper.author_name,
				authorAvatar: paper.author_avatar,
				categoryId: paper.category_id,
				categoryName: paper.category_name,
				pdfUrl: paper.pdf_url,
				status: paper.status,
				createdAt: paper.created_at,
				rejectionReason: paper.rejection_reason,
				approvedBy: paper.approved_by_id,
				interactions: {
					reactions: paper.reaction_count || 0,
					comments: paper.comment_count || 0,
					saves: paper.save_count || 0,
				},
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

	// Category Management Methods
	static async getAllCategories(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

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
			console.error("Admin get categories error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async updateCategory(req: AuthRequest, res: Response) {
		try {
			console.log("Update category request received:", req.params, req.body);

			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			const categoryId = req.params?.id as string;
			if (!categoryId) {
				return res.status(400).json({ error: "Category ID is required" });
			}

			// Validate request body - allow partial updates
			const { error, value } = categoryUpdateSchema.validate(req.body);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			const { name, description, imageUrl, imageHint } = value;

			// Check if category exists
			const existingCategory = await CategoryModel.findById(categoryId);
			if (!existingCategory) {
				return res.status(404).json({ error: "Category not found" });
			}

			// Handle ID change if newId is provided in the request body
			const newId = req.body.newId;
			if (newId && newId !== categoryId) {
				// Check if new ID already exists
				const existingWithNewId = await CategoryModel.findById(newId);
				if (existingWithNewId) {
					return res
						.status(409)
						.json({ error: "Category with new ID already exists" });
				}
			}

			const updateData = {
				name,
				description,
				imageUrl: imageUrl || null, // Convert empty string to null
				imageHint,
			};

			// If changing ID, we need to use a transaction to handle the complex update
			let updatedCategory;
			if (newId && newId !== categoryId) {
				const client = await db.getClient();

				try {
					await client.query("BEGIN");

					// First, create the new category with the new ID
					const createData = {
						id: newId,
						name: name || existingCategory.name,
						description:
							description !== undefined
								? description
								: existingCategory.description,
						image_url:
							imageUrl !== undefined
								? imageUrl || null
								: existingCategory.image_url,
						image_hint:
							imageHint !== undefined ? imageHint : existingCategory.image_hint,
					};

					const insertCategoryQuery = `
					INSERT INTO categories (id, name, description, image_url, image_hint)
					VALUES ($1, $2, $3, $4, $5)
					RETURNING *
				`;
					const categoryResult = await client.query(insertCategoryQuery, [
						createData.id,
						createData.name,
						createData.description,
						createData.image_url,
						createData.image_hint,
					]);

					// Then, update all papers to use the new category ID
					const updatePapersQuery = `
					UPDATE papers 
					SET category_id = $1, updated_at = NOW()
					WHERE category_id = $2
				`;
					const papersResult = await client.query(updatePapersQuery, [
						newId,
						categoryId,
					]);
					console.log(
						`Updated ${papersResult.rowCount} papers to use new category ID: ${newId}`
					);

					// Finally, delete the old category
					const deleteCategoryQuery = `DELETE FROM categories WHERE id = $1`;
					await client.query(deleteCategoryQuery, [categoryId]);

					await client.query("COMMIT");

					updatedCategory = {
						id: categoryResult.rows[0].id,
						name: categoryResult.rows[0].name,
						description: categoryResult.rows[0].description,
						image_url: categoryResult.rows[0].image_url,
						image_hint: categoryResult.rows[0].image_hint,
					};
				} catch (error) {
					await client.query("ROLLBACK");
					throw new Error(
						"Failed to update category ID: " + (error as Error).message
					);
				} finally {
					client.release();
				}
			} else {
				updatedCategory = await CategoryModel.update(categoryId, updateData);
			}

			if (!updatedCategory) {
				return res.status(500).json({ error: "Failed to update category" });
			}

			const response = {
				id: updatedCategory.id,
				name: updatedCategory.name,
				description: updatedCategory.description,
				imageUrl: updatedCategory.image_url,
				imageHint: updatedCategory.image_hint,
			};

			res.status(200).json(response);
		} catch (error) {
			console.error("Update category error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	// User Management Methods
	static async getAllUsers(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			const role = req.query?.role as string;
			const search = req.query?.search as string;
			const filters: any = {};

			if (role && role !== "all") {
				filters.role = role;
			}

			if (search && search.trim()) {
				filters.search = search.trim();
			}

			const users = await UserModel.findAll(filters);

			res.status(200).json(users);
		} catch (error) {
			console.error("Admin get users error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async updateUserRole(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			const userId = parseInt(req.params?.id as string);
			const { role } = req.body;

			if (isNaN(userId)) {
				return res.status(400).json({ error: "Invalid user ID" });
			}

			if (!["user", "admin", "owner"].includes(role)) {
				return res
					.status(400)
					.json({ error: "Invalid role. Must be 'user', 'admin', or 'owner'" });
			}

			// Check if target user exists
			const targetUser = await UserModel.findById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: "User not found" });
			}

			// Prevent non-owners from modifying owner accounts
			if (targetUser.role === "owner" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Only owners can modify owner accounts" });
			}

			// Prevent non-owners from creating owners
			if (role === "owner" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Only owners can assign owner role" });
			}

			// Prevent removing owner role from the last owner
			if (targetUser.role === "owner" && role !== "owner") {
				const allUsers = await UserModel.findAll({ role: "owner" });
				if (allUsers.length <= 1) {
					return res.status(400).json({
						error: "Cannot remove owner role. At least one owner must exist",
					});
				}
			}

			// Prevent users from modifying their own role
			if (userId === req.user.id) {
				return res.status(400).json({ error: "Cannot modify your own role" });
			}

			await UserModel.updateRole(userId, role);

			res.status(200).json({ message: "User role updated successfully" });
		} catch (error) {
			console.error("Update user role error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async deleteUser(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			const userId = parseInt(req.params?.id as string);

			if (isNaN(userId)) {
				return res.status(400).json({ error: "Invalid user ID" });
			}

			// Check if target user exists
			const targetUser = await UserModel.findById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: "User not found" });
			}

			// Prevent non-owners from deleting owner accounts
			if (targetUser.role === "owner" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Only owners can delete owner accounts" });
			}

			// Prevent deleting the last owner
			if (targetUser.role === "owner") {
				const allUsers = await UserModel.findAll({ role: "owner" });
				if (allUsers.length <= 1) {
					return res
						.status(400)
						.json({ error: "Cannot delete the last owner" });
				}
			}

			// Prevent users from deleting themselves
			if (userId === req.user.id) {
				return res
					.status(400)
					.json({ error: "Cannot delete your own account" });
			}

			await UserModel.deleteUser(userId);

			res.status(200).json({ message: "User deleted successfully" });
		} catch (error) {
			console.error("Delete user error:", error);
			if ((error as any).code === "23503") {
				// Foreign key constraint violation
				res
					.status(400)
					.json({ error: "Cannot delete user that has associated content" });
			} else {
				res.status(500).json({ error: "Internal server error" });
			}
		}
	}

	static async updateUser(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			const userId = parseInt(req.params?.id as string);
			const { full_name, email, birth_date, college_name, country } = req.body;

			if (isNaN(userId)) {
				return res.status(400).json({ error: "Invalid user ID" });
			}

			// Check if target user exists
			const targetUser = await UserModel.findById(userId);
			if (!targetUser) {
				return res.status(404).json({ error: "User not found" });
			}

			// Prevent non-owners from modifying owner accounts (except their own profile)
			if (
				targetUser.role === "owner" &&
				req.user.role !== "owner" &&
				userId !== req.user.id
			) {
				return res
					.status(403)
					.json({ error: "Only owners can modify other owner accounts" });
			}

			const updates: any = {};
			if (full_name !== undefined) updates.full_name = full_name;
			if (email !== undefined) updates.email = email;
			if (birth_date !== undefined) updates.birth_date = birth_date;
			if (college_name !== undefined) updates.college_name = college_name;
			if (country !== undefined) updates.country = country;

			await UserModel.updateUser(userId, updates);

			res.status(200).json({ message: "User updated successfully" });
		} catch (error) {
			console.error("Update user error:", error);
			if ((error as any).code === "23505") {
				// Unique constraint violation (email)
				res.status(400).json({ error: "Email already exists" });
			} else {
				res.status(500).json({ error: "Internal server error" });
			}
		}
	}

	// Insights Methods
	static async getInsights(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Check if user is admin or owner
			if (req.user.role !== "admin" && req.user.role !== "owner") {
				return res
					.status(403)
					.json({ error: "Admin or Owner access required" });
			}

			// Get overall statistics
			const overallStats = await db.query(`
				SELECT 
					COUNT(*) as total_papers,
					COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_papers,
					COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_papers,
					COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_papers
				FROM papers
			`);

			const userStats = await db.query(`
				SELECT 
					COUNT(*) as total_users,
					COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
					COUNT(CASE WHEN role = 'owner' THEN 1 END) as owner_users,
					COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
				FROM users
			`);

			const categoryStats = await db.query(`
				SELECT COUNT(*) as total_categories FROM categories
			`);

			// Get papers by status over time (last 30 days)
			const papersOverTime = await db.query(`
				SELECT 
					DATE(created_at) as date,
					COUNT(*) as count,
					status
				FROM papers 
				WHERE created_at >= NOW() - INTERVAL '30 days'
				GROUP BY DATE(created_at), status
				ORDER BY date DESC
			`);

			// Get top categories by paper count
			const topCategories = await db.query(`
				SELECT 
					c.id,
					c.name,
					COUNT(p.id) as paper_count
				FROM categories c
				LEFT JOIN papers p ON c.id = p.category_id
				GROUP BY c.id, c.name
				ORDER BY paper_count DESC
				LIMIT 10
			`);

			// Get most active users (by paper submissions)
			const mostActiveUsers = await db.query(`
				SELECT 
					u.id,
					u.full_name,
					u.email,
					COUNT(p.id) as paper_count
				FROM users u
				LEFT JOIN papers p ON u.id = p.author_id
				WHERE u.role = 'user'
				GROUP BY u.id, u.full_name, u.email
				ORDER BY paper_count DESC
				LIMIT 10
			`);

			// Get recent activity (last 7 days)
			const recentActivity = await db.query(`
				SELECT 
					'paper_submission' as activity_type,
					p.title as description,
					p.created_at as timestamp,
					u.full_name as user_name
				FROM papers p
				JOIN users u ON p.author_id = u.id
				WHERE p.created_at >= NOW() - INTERVAL '7 days'
				
				UNION ALL
				
				SELECT 
					'user_registration' as activity_type,
					CONCAT('New user registered: ', u.full_name) as description,
					u.created_at as timestamp,
					u.full_name as user_name
				FROM users u
				WHERE u.created_at >= NOW() - INTERVAL '7 days'
				
				ORDER BY timestamp DESC
				LIMIT 20
			`);

			// Get interaction statistics
			const interactionStats = await db.query(`
				SELECT 
					COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) as total_comments,
					COUNT(CASE WHEN interaction_type = 'save' THEN 1 END) as total_saves
				FROM paper_interactions
			`);

			const reactionStats = await db.query(`
				SELECT 
					reaction_type,
					COUNT(*) as count
				FROM paper_reactions
				GROUP BY reaction_type
				ORDER BY count DESC
			`);

			const response = {
				overview: {
					totalPapers: parseInt(overallStats.rows[0].total_papers),
					approvedPapers: parseInt(overallStats.rows[0].approved_papers),
					pendingPapers: parseInt(overallStats.rows[0].pending_papers),
					rejectedPapers: parseInt(overallStats.rows[0].rejected_papers),
					totalUsers: parseInt(userStats.rows[0].total_users),
					adminUsers: parseInt(userStats.rows[0].admin_users),
					ownerUsers: parseInt(userStats.rows[0].owner_users),
					regularUsers: parseInt(userStats.rows[0].regular_users),
					totalCategories: parseInt(categoryStats.rows[0].total_categories),
					totalComments: parseInt(interactionStats.rows[0].total_comments),
					totalSaves: parseInt(interactionStats.rows[0].total_saves),
				},
				charts: {
					papersOverTime: papersOverTime.rows,
					topCategories: topCategories.rows,
					reactionDistribution: reactionStats.rows,
				},
				lists: {
					mostActiveUsers: mostActiveUsers.rows,
					recentActivity: recentActivity.rows,
				},
			};

			res.status(200).json(response);
		} catch (error) {
			console.error("Get insights error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
