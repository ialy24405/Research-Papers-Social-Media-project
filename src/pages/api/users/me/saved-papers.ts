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

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const { limit = 50, offset = 0 } = req.query;
		const limitNum = parseInt(limit as string, 10);
		const offsetNum = parseInt(offset as string, 10);

		// Get user's saved papers
		const result = await query(
			`SELECT 
				p.id, p.title, p.description, p.pdf_url, p.ai_summary, p.status,
				p.created_at, p.updated_at,
				u.id as author_id, u.full_name as author_name,
				c.id as category_id, c.name as category_name,
				pi.created_at as saved_at
			FROM paper_interactions pi
			JOIN papers p ON pi.paper_id = p.id
			JOIN users u ON p.author_id = u.id
			JOIN categories c ON p.category_id = c.id
			WHERE pi.user_id = $1 AND pi.interaction_type = 'save'
			ORDER BY pi.created_at DESC
			LIMIT $2 OFFSET $3`,
			[req.userId, limitNum, offsetNum]
		);

		// Get total count
		const countResult = await query(
			`SELECT COUNT(*) as total
			FROM paper_interactions pi
			WHERE pi.user_id = $1 AND pi.interaction_type = 'save'`,
			[req.userId]
		);

		const papers = result.rows.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			pdfUrl: row.pdf_url,
			aiSummary: row.ai_summary,
			status: row.status,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			savedAt: row.saved_at,
			author: {
				id: row.author_id,
				name: row.author_name,
			},
			category: {
				id: row.category_id,
				name: row.category_name,
			},
		}));

		res.status(200).json({
			papers,
			pagination: {
				total: parseInt(countResult.rows[0].total, 10),
				limit: limitNum,
				offset: offsetNum,
			},
		});
	} catch (error) {
		console.error("Get saved papers error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
