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
		// Check if paper exists
		const paperResult = await query("SELECT id FROM papers WHERE id = $1", [
			paperId,
		]);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		// Get reaction statistics
		const statsResult = await query(
			`SELECT 
				reaction_type,
				COUNT(*) as count
			FROM paper_reactions 
			WHERE paper_id = $1 
			GROUP BY reaction_type`,
			[paperId]
		);

		// Get total reactions count
		const totalResult = await query(
			`SELECT COUNT(*) as total
			FROM paper_reactions 
			WHERE paper_id = $1`,
			[paperId]
		);

		// Format the response
		const stats = {
			like: 0,
			love: 0,
			support: 0,
			insightful: 0,
		};

		statsResult.rows.forEach((row) => {
			stats[row.reaction_type as keyof typeof stats] = parseInt(row.count, 10);
		});

		res.status(200).json({
			paperId: paperId,
			reactions: stats,
			total: parseInt(totalResult.rows[0].total, 10),
		});
	} catch (error) {
		console.error("Get reaction stats error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
