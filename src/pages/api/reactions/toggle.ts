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
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const { paperId, reactionType } = req.body;

		// Validate input
		if (!paperId || !reactionType) {
			return res
				.status(400)
				.json({ error: "Paper ID and reaction type are required" });
		}

		const validReactions = ["like", "love", "support", "insightful"];
		if (!validReactions.includes(reactionType)) {
			return res.status(400).json({
				error: "Invalid reaction type",
				validTypes: validReactions,
			});
		}

		// Check if paper exists
		const paperResult = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// Check if user already has a reaction for this paper
		const existingReaction = await query(
			"SELECT id, reaction_type FROM paper_reactions WHERE paper_id = $1 AND user_id = $2",
			[paperId, req.userId]
		);

		if (existingReaction.rows.length > 0) {
			const current = existingReaction.rows[0];

			if (current.reaction_type === reactionType) {
				// Same reaction - remove it (toggle off)
				await query("DELETE FROM paper_reactions WHERE id = $1", [current.id]);

				res.status(200).json({
					message: "Reaction removed",
					action: "removed",
					reactionType: null,
				});
			} else {
				// Different reaction - update it
				await query(
					"UPDATE paper_reactions SET reaction_type = $1, updated_at = NOW() WHERE id = $2",
					[reactionType, current.id]
				);

				res.status(200).json({
					message: "Reaction updated",
					action: "updated",
					reactionType: reactionType,
				});
			}
		} else {
			// No existing reaction - create new one
			await query(
				"INSERT INTO paper_reactions (paper_id, user_id, reaction_type, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
				[paperId, req.userId, reactionType]
			);

			res.status(201).json({
				message: "Reaction added",
				action: "added",
				reactionType: reactionType,
			});
		}
	} catch (error) {
		console.error("Toggle reaction error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
