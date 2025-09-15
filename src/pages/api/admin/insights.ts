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
		// Get overall statistics - match backend format
		const overallStats = await query(`
			SELECT 
				COUNT(*) as total_papers,
				COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_papers,
				COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_papers,
				COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_papers
			FROM papers
		`);

		const userStats = await query(`
			SELECT 
				COUNT(*) as total_users,
				COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
				COUNT(CASE WHEN role = 'owner' THEN 1 END) as owner_users,
				COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
			FROM users
		`);

		const categoryStats = await query(`
			SELECT COUNT(*) as total_categories FROM categories
		`);

		// Get papers by status over time (last 30 days)
		const papersOverTime = await query(`
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
		const topCategories = await query(`
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
		const mostActiveUsers = await query(`
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
		const recentActivity = await query(`
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
		const interactionStats = await query(`
			SELECT 
				COUNT(CASE WHEN interaction_type = 'comment' THEN 1 END) as total_comments,
				COUNT(CASE WHEN interaction_type = 'save' THEN 1 END) as total_saves
			FROM paper_interactions
		`);

		const reactionStats = await query(`
			SELECT 
				reaction_type,
				COUNT(*) as count
			FROM paper_reactions
			GROUP BY reaction_type
			ORDER BY count DESC
		`);

		// Format response to match backend structure
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
				totalComments: parseInt(interactionStats.rows[0]?.total_comments || 0),
				totalSaves: parseInt(interactionStats.rows[0]?.total_saves || 0),
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
		console.error("Admin insights fetch error:", error);
		// Return empty insights to prevent frontend crashes - match backend format
		res.status(200).json({
			overview: {
				totalPapers: 0,
				approvedPapers: 0,
				pendingPapers: 0,
				rejectedPapers: 0,
				totalUsers: 0,
				adminUsers: 0,
				ownerUsers: 0,
				regularUsers: 0,
				totalCategories: 0,
				totalComments: 0,
				totalSaves: 0,
			},
			charts: {
				papersOverTime: [],
				topCategories: [],
				reactionDistribution: [],
			},
			lists: {
				mostActiveUsers: [],
				recentActivity: [],
			},
		});
	}
}
