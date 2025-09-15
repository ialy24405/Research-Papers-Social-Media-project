import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
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
		const { limit = 50, offset = 0 } = req.query;
		const limitNum = parseInt(limit as string, 10);
		const offsetNum = parseInt(offset as string, 10);

		// Check if paper exists
		const paperResult = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// Get comments for this paper
		const commentsResult = await query(
			`SELECT 
				pi.id,
				pi.comment_text,
				pi.parent_comment_id,
				pi.created_at,
				u.id as user_id,
				u.full_name as user_name
			FROM paper_interactions pi
			JOIN users u ON pi.user_id = u.id
			WHERE pi.paper_id = $1 AND pi.interaction_type = 'comment'
			ORDER BY pi.created_at ASC
			LIMIT $2 OFFSET $3`,
			[paperId, limitNum, offsetNum]
		);

		// Get total comments count
		const countResult = await query(
			`SELECT COUNT(*) as total
			FROM paper_interactions 
			WHERE paper_id = $1 AND interaction_type = 'comment'`,
			[paperId]
		);

		// Organize comments hierarchically (top-level comments and their replies)
		const commentsMap = new Map();
		const topLevelComments: any[] = [];

		// First pass: create all comment objects
		commentsResult.rows.forEach((row) => {
			const comment = {
				id: row.id,
				text: row.comment_text,
				parentCommentId: row.parent_comment_id,
				createdAt: row.created_at,
				author: {
					id: row.user_id,
					name: row.user_name,
				},
				replies: [],
			};
			commentsMap.set(row.id, comment);
		});

		// Second pass: organize into hierarchy
		commentsResult.rows.forEach((row) => {
			const comment = commentsMap.get(row.id);

			if (row.parent_comment_id) {
				// This is a reply
				const parent = commentsMap.get(row.parent_comment_id);
				if (parent) {
					parent.replies.push(comment);
				}
			} else {
				// This is a top-level comment
				topLevelComments.push(comment);
			}
		});

		res.status(200).json({
			comments: topLevelComments,
			pagination: {
				total: parseInt(countResult.rows[0].total, 10),
				limit: limitNum,
				offset: offsetNum,
			},
		});
	} catch (error) {
		console.error("Get comments error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
