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
			// Get all users with pagination and filtering
			const { limit = 50, offset = 0, search = "", role = "" } = req.query;
			const limitNum = parseInt(limit as string, 10);
			const offsetNum = parseInt(offset as string, 10);

			let whereClause = "WHERE 1=1";
			const queryParams = [];
			let paramCount = 0;

			if (search) {
				paramCount++;
				whereClause += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
				queryParams.push(`%${search}%`);
			}

			if (role) {
				paramCount++;
				whereClause += ` AND role = $${paramCount}`;
				queryParams.push(role);
			}

			// Add limit and offset parameters
			queryParams.push(limitNum, offsetNum);

			const usersResult = await query(
				`SELECT 
					id, email, full_name, birth_date, college_name, country, 
					avatar_url, role, created_at
				FROM users 
				${whereClause}
				ORDER BY created_at DESC
				LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
				queryParams
			);

			// Get total count
			const countResult = await query(
				`SELECT COUNT(*) as total FROM users ${whereClause}`,
				queryParams.slice(0, paramCount)
			);

			const users = usersResult.rows.map((row: any) => ({
				id: row.id,
				email: row.email,
				fullName: row.full_name,
				birthDate: row.birth_date,
				collegeName: row.college_name,
				country: row.country,
				avatarUrl: row.avatar_url,
				role: row.role,
				createdAt: row.created_at,
			}));

			res.status(200).json({
				users,
				pagination: {
					total: parseInt(countResult.rows[0].total, 10),
					limit: limitNum,
					offset: offsetNum,
				},
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Admin users error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
