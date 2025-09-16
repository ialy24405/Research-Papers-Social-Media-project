import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
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

	try {
		if (req.method === "GET") {
			// Get all categories
			const result = await query(
				`SELECT id, name, description, image_url, image_hint 
				FROM categories 
				ORDER BY name`,
				[]
			);

			const categories = result.rows.map((row: any) => ({
				id: row.id,
				name: row.name,
				description: row.description,
				imageUrl: row.image_url, // Convert to camelCase for consistency
				imageHint: row.image_hint, // Convert to camelCase for consistency
			}));

			res.status(200).json(categories);
		} else if (req.method === "POST") {
			// Create new category
			const { id, name, description, image_url, image_hint } = req.body;

			// Validate required fields
			if (!id || !name) {
				return res.status(400).json({
					error: "Category ID and name are required",
				});
			}

			// Check if category already exists
			const existingCategory = await query(
				"SELECT id FROM categories WHERE id = $1",
				[id]
			);

			if (existingCategory.rows.length > 0) {
				return res.status(409).json({
					error: "Category with this ID already exists",
				});
			}

			const result = await query(
				`INSERT INTO categories (id, name, description, image_url, image_hint) 
				VALUES ($1, $2, $3, $4, $5) 
				RETURNING *`,
				[id, name, description || null, image_url || null, image_hint || null]
			);

			const category = result.rows[0];
			res.status(201).json({
				message: "Category created successfully",
				category: {
					id: category.id,
					name: category.name,
					description: category.description,
					image_url: category.image_url,
					image_hint: category.image_hint,
				},
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error: any) {
		console.error("Admin categories error:", error);

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
