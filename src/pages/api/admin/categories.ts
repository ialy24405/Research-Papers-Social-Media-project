import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends NextApiRequest {
	userId?: number;
	userRole?: string;
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
			role: string;
		};
		req.userId = decoded.userId;
		req.userRole = decoded.role;
		return true;
	} catch (error) {
		return false;
	}
};

const checkAdminRole = async (req: AuthenticatedRequest): Promise<boolean> => {
	try {
		if (!req.userId) return false;

		const result = await query("SELECT role FROM users WHERE id = $1", [
			req.userId,
		]);

		if (result.rows.length === 0) return false;

		const userRole = result.rows[0].role;
		req.userRole = userRole;
		return userRole === "admin" || userRole === "owner";
	} catch (error) {
		return false;
	}
};

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	// Authentication
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Authentication required" });
	}

	// Check admin role
	if (!(await checkAdminRole(req))) {
		return res.status(403).json({ error: "Admin or Owner access required" });
	}

	try {
		if (req.method === "GET") {
			// Get all categories
			const categories = await query(`
				SELECT id, name, description, image_url, image_hint, created_at
				FROM categories 
				ORDER BY name ASC
			`);

			const response = categories.rows.map((category: any) => ({
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
				createdAt: category.created_at,
			}));

			return res.status(200).json(response);
		} else if (req.method === "POST") {
			// Create new category
			const { id, name, description, imageUrl, imageHint } = req.body;

			// Validate required fields
			if (!id || !name) {
				return res.status(400).json({ error: "ID and name are required" });
			}

			// Check if category already exists
			const existing = await query("SELECT id FROM categories WHERE id = $1", [
				id,
			]);
			if (existing.rows.length > 0) {
				return res.status(409).json({ error: "Category ID already exists" });
			}

			// Create category
			const result = await query(
				`
				INSERT INTO categories (id, name, description, image_url, image_hint)
				VALUES ($1, $2, $3, $4, $5)
				RETURNING id, name, description, image_url, image_hint, created_at
			`,
				[id, name, description || null, imageUrl || null, imageHint || null]
			);

			const category = result.rows[0];
			const response = {
				id: category.id,
				name: category.name,
				description: category.description,
				imageUrl: category.image_url,
				imageHint: category.image_hint,
				createdAt: category.created_at,
			};

			return res.status(201).json(response);
		} else {
			return res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Admin categories error:", error);
		if ((error as any).code === "23503") {
			// Foreign key constraint violation
			return res.status(400).json({
				error: "Cannot delete category that has associated papers",
			});
		}
		return res.status(500).json({ error: "Internal server error" });
	}
}
