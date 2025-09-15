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
	if (req.method !== "POST") {
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
		const { commentText, parentCommentId } = req.body;

		// Validate input
		if (!commentText || commentText.trim().length === 0) {
			return res.status(400).json({ error: "Comment text is required" });
		}

		if (commentText.length > 1000) {
			return res
				.status(400)
				.json({ error: "Comment text is too long (max 1000 characters)" });
		}

		// Check if paper exists
		const paperResult = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// If parentCommentId is provided, check if parent comment exists
		if (parentCommentId) {
			const parentResult = await query(
				"SELECT id FROM paper_interactions WHERE id = $1 AND interaction_type = 'comment' AND paper_id = $2",
				[parentCommentId, paperId]
			);

			if (parentResult.rows.length === 0) {
				return res.status(404).json({ error: "Parent comment not found" });
			}
		}

		// Add comment
		const result = await query(
			`INSERT INTO paper_interactions 
			(paper_id, user_id, interaction_type, comment_text, parent_comment_id, created_at) 
			VALUES ($1, $2, 'comment', $3, $4, NOW()) 
			RETURNING id, created_at`,
			[paperId, req.userId, commentText.trim(), parentCommentId || null]
		);

		// Get user info for the response
		const userResult = await query(
			"SELECT full_name FROM users WHERE id = $1",
			[req.userId]
		);

		const comment = result.rows[0];
		const user = userResult.rows[0];

		res.status(201).json({
			message: "Comment added successfully",
			comment: {
				id: comment.id,
				text: commentText.trim(),
				parentCommentId: parentCommentId || null,
				createdAt: comment.created_at,
				author: {
					id: req.userId,
					name: user.full_name,
				},
			},
		});
	} catch (error) {
		console.error("Add comment error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
