import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends NextApiRequest {
	userId?: number;
}

const authenticateToken = (req: AuthenticatedRequest): boolean => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return false;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: number;
		};
		req.userId = decoded.userId;
		return true;
	} catch (error) {
		return false;
	}
};

const isAdmin = async (userId: number): Promise<boolean> => {
	const result = await query("SELECT role FROM users WHERE id = $1", [userId]);

	if (result.rows.length === 0) {
		return false;
	}

	const userRole = result.rows[0].role;
	return userRole === "admin" || userRole === "owner";
};

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Check admin permissions
	if (!(await isAdmin(req.userId!))) {
		return res.status(403).json({ error: "Admin access required" });
	}

	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		return res.status(400).json({ error: "Invalid category ID" });
	}

	const categoryId = id as string;

	try {
		if (req.method === "GET") {
			// Get specific category
			const result = await query(
				`SELECT id, name, description, image_url, image_hint 
				FROM categories WHERE id = $1`,
				[categoryId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Category not found" });
			}

			const category = result.rows[0];
			res.status(200).json({
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
			});
		} else if (req.method === "PUT") {
			// Update category
			const { name, description, imageUrl, imageHint } = req.body;

			if (!name) {
				return res.status(400).json({ error: "Category name is required" });
			}

			const result = await query(
				`UPDATE categories 
				SET name = $1, description = $2, image_url = $3, image_hint = $4
				WHERE id = $5
				RETURNING *`,
				[
					name,
					description || null,
					imageUrl || null,
					imageHint || null,
					categoryId,
				]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Category not found" });
			}

			const category = result.rows[0];
			res.status(200).json({
				message: "Category updated successfully",
				category: {
					id: category.id,
					name: category.name,
					description: category.description,
					imageUrl: category.image_url,
					imageHint: category.image_hint,
				},
			});
		} else if (req.method === "DELETE") {
			// Delete category
			// First check if any papers use this category
			const papersCheck = await query(
				"SELECT COUNT(*) as count FROM papers WHERE category_id = $1",
				[categoryId]
			);

			const paperCount = parseInt(papersCheck.rows[0].count, 10);

			if (paperCount > 0) {
				return res.status(400).json({
					error: `Cannot delete category. ${paperCount} paper(s) are using this category.`,
					paperCount: paperCount,
				});
			}

			// Check if category exists
			const categoryCheck = await query(
				"SELECT id FROM categories WHERE id = $1",
				[categoryId]
			);

			if (categoryCheck.rows.length === 0) {
				return res.status(404).json({ error: "Category not found" });
			}

			// Delete the category
			await query("DELETE FROM categories WHERE id = $1", [categoryId]);

			res.status(200).json({
				message: "Category deleted successfully",
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error: any) {
		console.error("Admin category management error:", error);

		// Handle unique constraint violations
		if (error.code === "23505") {
			return res.status(409).json({
				error: "Category name already exists",
			});
		}

		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
}
