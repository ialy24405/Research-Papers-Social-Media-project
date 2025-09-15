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
		};
		req.userId = decoded.userId;
		return true;
	} catch (error) {
		return false;
	}
};

const checkAdminAccess = async (
	req: AuthenticatedRequest
): Promise<boolean> => {
	if (!req.userId) return false;

	try {
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
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Check admin access
	if (!(await checkAdminAccess(req))) {
		return res.status(403).json({ error: "Admin access required" });
	}

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Get total counts
		const usersResult = await query("SELECT COUNT(*) as total FROM users");
		const totalUsers = parseInt(usersResult.rows[0].total);

		const papersResult = await query("SELECT COUNT(*) as total FROM papers");
		const totalPapers = parseInt(papersResult.rows[0].total);

		const categoriesResult = await query(
			"SELECT COUNT(*) as total FROM categories"
		);
		const totalCategories = parseInt(categoriesResult.rows[0].total);

		// Get papers by status
		const paperStatusResult = await query(`
			SELECT status, COUNT(*) as count 
			FROM papers 
			GROUP BY status
		`);

		const papersByStatus = {
			approved: 0,
			pending: 0,
			rejected: 0,
		};

		paperStatusResult.rows.forEach((row) => {
			if (row.status in papersByStatus) {
				papersByStatus[row.status as keyof typeof papersByStatus] = parseInt(
					row.count
				);
			}
		});

		// Get recent activity (papers created in last 30 days)
		const recentActivityResult = await query(`
			SELECT DATE(created_at) as date, COUNT(*) as count 
			FROM papers 
			WHERE created_at >= NOW() - INTERVAL '30 days'
			GROUP BY DATE(created_at)
			ORDER BY DATE(created_at) DESC
			LIMIT 30
		`);

		const recentActivity = recentActivityResult.rows.map((row) => ({
			date: row.date,
			count: parseInt(row.count),
		}));

		// Get user growth (users registered in last 30 days)
		const userGrowthResult = await query(`
			SELECT DATE(created_at) as date, COUNT(*) as count 
			FROM users 
			WHERE created_at >= NOW() - INTERVAL '30 days'
			GROUP BY DATE(created_at)
			ORDER BY DATE(created_at) DESC
			LIMIT 30
		`);

		const userGrowth = userGrowthResult.rows.map((row) => ({
			date: row.date,
			count: parseInt(row.count),
		}));

		// Get top categories by paper count
		const topCategoriesResult = await query(`
			SELECT c.name, COUNT(p.id) as paper_count
			FROM categories c
			LEFT JOIN papers p ON c.id = p.category_id
			GROUP BY c.id, c.name
			ORDER BY paper_count DESC
			LIMIT 10
		`);

		const topCategories = topCategoriesResult.rows.map((row) => ({
			name: row.name,
			paperCount: parseInt(row.paper_count),
		}));

		const insights = {
			totalUsers,
			totalPapers,
			totalCategories,
			papersByStatus,
			recentActivity,
			userGrowth,
			topCategories,
		};

		res.status(200).json(insights);
	} catch (error) {
		console.error("Admin insights fetch error:", error);
		// Return empty insights to prevent frontend crashes
		res.status(200).json({
			totalUsers: 0,
			totalPapers: 0,
			totalCategories: 0,
			papersByStatus: {
				approved: 0,
				pending: 0,
				rejected: 0,
			},
			recentActivity: [],
			userGrowth: [],
			topCategories: [],
		});
	}
}
