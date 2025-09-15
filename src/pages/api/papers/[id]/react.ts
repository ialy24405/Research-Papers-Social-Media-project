import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
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
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { id } = req.query;
	const paperId = parseInt(id as string);

	if (!paperId || isNaN(paperId)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	try {
		// Check if paper exists
		const paperCheck = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);
		if (paperCheck.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// Check if user already reacted
		const existingReaction = await query(
			"SELECT id FROM paper_reactions WHERE paper_id = $1 AND user_id = $2",
			[paperId, req.userId]
		);

		if (existingReaction.rows.length > 0) {
			// Remove reaction (unlike)
			await query(
				"DELETE FROM paper_reactions WHERE paper_id = $1 AND user_id = $2",
				[paperId, req.userId]
			);
			res.status(200).json({ message: "Reaction removed" });
		} else {
			// Add reaction (like)
			await query(
				"INSERT INTO paper_reactions (paper_id, user_id, reaction_type, created_at) VALUES ($1, $2, $3, NOW())",
				[paperId, req.userId, "like"]
			);
			res.status(200).json({ message: "Reaction added" });
		}
	} catch (error) {
		console.error("React to paper error:", error);
		res.status(500).json({ error: "Failed to react to paper" });
	}
}
