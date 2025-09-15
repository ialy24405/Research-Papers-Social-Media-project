import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

interface AuthRequest extends NextApiRequest {
	user?: {
		id: number;
		email: string;
		role: string;
	};
}

export default async function handler(req: AuthRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Authentication check
		const token = req.headers.authorization?.replace("Bearer ", "");
		if (!token) {
			return res.status(401).json({ error: "Authentication required" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
		} catch (error) {
			return res.status(401).json({ error: "Invalid token" });
		}

		// Check if user is admin or owner
		if (decoded.role !== "admin" && decoded.role !== "owner") {
			return res.status(403).json({ error: "Admin or Owner access required" });
		}

		// Get query parameters
		const { role, search } = req.query;

		// Build SQL query
		let sql = `
			SELECT 
				id,
				email,
				full_name as name,
				role,
				created_at,
				avatar_url as profile_image,
				last_login as last_login_at
			FROM users
		`;

		const conditions = [];
		const params = [];

		// Apply filters
		if (role && role !== "all") {
			conditions.push(`role = $${params.length + 1}`);
			params.push(role);
		}

		if (search && typeof search === "string" && search.trim()) {
			conditions.push(
				`(email ILIKE $${params.length + 1} OR full_name ILIKE $${
					params.length + 1
				})`
			);
			params.push(`%${search.trim()}%`);
		}

		if (conditions.length > 0) {
			sql += ` WHERE ` + conditions.join(" AND ");
		}

		sql += ` ORDER BY created_at DESC`;

		const users = await query(sql, params);

		// Format response to match backend format
		const response = users.rows.map((user: any) => ({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			createdAt: user.created_at,
			profileImage: user.profile_image,
			lastLoginAt: user.last_login_at,
		}));

		res.status(200).json(response);
	} catch (error) {
		console.error("Admin users fetch error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
