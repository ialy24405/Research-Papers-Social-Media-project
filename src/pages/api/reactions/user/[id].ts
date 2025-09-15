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

	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	const paperId = parseInt(id, 10);
	if (isNaN(paperId)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	try {
		// Check if paper exists
		const paperResult = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// Get user's reaction for this paper
		const reactionResult = await query(
			`SELECT reaction_type, created_at, updated_at
			FROM paper_reactions 
			WHERE paper_id = $1 AND user_id = $2`,
			[paperId, req.userId]
		);

		if (reactionResult.rows.length === 0) {
			res.status(200).json({
				paperId: paperId,
				userReaction: null,
				hasReacted: false,
			});
		} else {
			const reaction = reactionResult.rows[0];
			res.status(200).json({
				paperId: paperId,
				userReaction: {
					type: reaction.reaction_type,
					createdAt: reaction.created_at,
					updatedAt: reaction.updated_at,
				},
				hasReacted: true,
			});
		}
	} catch (error) {
		console.error("Get user reaction error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
