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
		const { limit = 20 } = req.query;
		const limitNum = parseInt(limit as string, 10);

		// Get user interactions with paper details
		const result = await query(
			`SELECT 
				pi.id,
				pi.interaction_type as type,
				pi.interaction_type as action,
				pi.created_at,
				p.id as paper_id,
				p.title,
				u.id as author_id,
				u.full_name as author_name,
				c.name as category_name
			FROM paper_interactions pi
			JOIN papers p ON pi.paper_id = p.id
			JOIN users u ON p.author_id = u.id
			JOIN categories c ON p.category_id = c.id
			WHERE pi.user_id = $1
			ORDER BY pi.created_at DESC
			LIMIT $2`,
			[req.userId, limitNum]
		);

		// Format the response to match expected interface
		const interactions = result.rows.map((row) => ({
			id: row.id.toString(),
			type: row.type,
			action: row.action,
			createdAt: row.created_at,
			paper: {
				id: row.paper_id,
				title: row.title,
				author: {
					id: row.author_id,
					name: row.author_name,
				},
				category: row.category_name,
			},
		}));

		res.status(200).json(interactions);
	} catch (error) {
		console.error("Get user interactions error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
