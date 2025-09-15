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
	console.log("=== Next.js Admin Papers API Called ===");
	console.log("Method:", req.method);
	console.log("URL:", req.url);
	console.log("Headers:", req.headers);

	// Authenticate user
	if (!authenticateToken(req)) {
		console.log("Authentication failed");
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
		const { status, category, author, page = "1", limit = "20" } = req.query;

		let whereConditions = [];
		let queryParams = [];
		let paramIndex = 1;

		// Filter by status
		if (status && status !== "all") {
			whereConditions.push(`p.status = $${paramIndex}`);
			queryParams.push(status);
			paramIndex++;
		}

		// Filter by category
		if (category) {
			whereConditions.push(`p.category_id = $${paramIndex}`);
			queryParams.push(category);
			paramIndex++;
		}

		// Filter by author
		if (author) {
			whereConditions.push(`u.full_name ILIKE $${paramIndex}`);
			queryParams.push(`%${author}%`);
			paramIndex++;
		}

		const whereClause =
			whereConditions.length > 0
				? `WHERE ${whereConditions.join(" AND ")}`
				: "";

		// Calculate offset for pagination
		const pageNum = parseInt(page as string) || 1;
		const limitNum = parseInt(limit as string) || 20;
		const offset = (pageNum - 1) * limitNum;

		// Get total count for pagination
		const countQuery = `
			SELECT COUNT(*) as total
			FROM papers p 
			JOIN users u ON p.author_id = u.id 
			LEFT JOIN categories c ON p.category_id = c.id 
			${whereClause}
		`;

		const countResult = await query(countQuery, queryParams);
		const totalPapers = parseInt(countResult.rows[0].total);

		// Get papers with pagination and interaction counts
		const papersQuery = `
			SELECT p.*, u.full_name as author_name, u.email as author_email, u.avatar_url as author_avatar,
				c.name as category_name,
				COALESCE(reaction_counts.reaction_count, 0) as reaction_count,
				COALESCE(comment_counts.comment_count, 0) as comment_count,
				COALESCE(save_counts.save_count, 0) as save_count,
				p.rejection_reason,
				p.approved_by_id
			FROM papers p 
			JOIN users u ON p.author_id = u.id 
			LEFT JOIN categories c ON p.category_id = c.id 
			LEFT JOIN (
				SELECT paper_id, COUNT(*) as reaction_count
				FROM paper_reactions
				GROUP BY paper_id
			) reaction_counts ON p.id = reaction_counts.paper_id
			LEFT JOIN (
				SELECT paper_id, COUNT(*) as comment_count
				FROM paper_interactions
				WHERE interaction_type = 'comment'
				GROUP BY paper_id
			) comment_counts ON p.id = comment_counts.paper_id
			LEFT JOIN (
				SELECT paper_id, COUNT(*) as save_count
				FROM paper_interactions
				WHERE interaction_type = 'save'
				GROUP BY paper_id
			) save_counts ON p.id = save_counts.paper_id
			${whereClause}
			ORDER BY p.created_at DESC
			LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
		`;

		queryParams.push(limitNum.toString(), offset.toString());

		const papersResult = await query(papersQuery, queryParams);

		console.log(
			"Admin papers query result:",
			papersResult.rows.length,
			"papers found"
		);

		// Transform the data to match backend format
		const papers = papersResult.rows.map((row) => ({
			id: row.id,
			title: row.title,
			name: row.title, // Backend uses 'name' for title
			description: row.description, // Use correct field name from database
			authorId: row.author_id,
			authorName: row.author_name,
			authorAvatar: row.author_avatar,
			categoryId: row.category_id,
			categoryName: row.category_name,
			pdfUrl: row.pdf_url, // Use correct field name from database
			status: row.status,
			createdAt: row.created_at,
			rejectionReason: row.rejection_reason,
			approvedBy: row.approved_by_id,
			interactions: {
				reactions: parseInt(row.reaction_count) || 0,
				comments: parseInt(row.comment_count) || 0,
				saves: parseInt(row.save_count) || 0,
			},
		}));

		// For backward compatibility with existing frontend, return just the papers array
		console.log("Admin papers response:", papers.length, "papers");
		console.log("Returning papers array:", Array.isArray(papers), papers);
		res.status(200).json(papers);
	} catch (error) {
		console.error("Admin papers fetch error:", error);
		console.error("Error details:", error);
		// Return empty array to prevent frontend crashes - but add debugging info
		console.log("Returning empty array due to error");
		res.status(200).json([]);
	}
}
