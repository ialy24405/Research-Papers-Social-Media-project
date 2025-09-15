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
	if (req.method !== "POST" && req.method !== "DELETE") {
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

		if (req.method === "POST") {
			// Save paper
			try {
				await query(
					`INSERT INTO paper_interactions (paper_id, user_id, interaction_type, created_at) 
					VALUES ($1, $2, 'save', NOW())`,
					[paperId, req.userId]
				);

				res.status(201).json({
					message: "Paper saved successfully",
					saved: true,
				});
			} catch (error: any) {
				// Check if it's a duplicate key error (paper already saved)
				if (error.code === "23505") {
					return res.status(409).json({ error: "Paper already saved" });
				}
				throw error;
			}
		} else if (req.method === "DELETE") {
			// Unsave paper
			const result = await query(
				`DELETE FROM paper_interactions 
				WHERE paper_id = $1 AND user_id = $2 AND interaction_type = 'save'`,
				[paperId, req.userId]
			);

			if (result.rowCount === 0) {
				return res.status(404).json({ error: "Paper was not saved" });
			}

			res.status(200).json({
				message: "Paper unsaved successfully",
				saved: false,
			});
		}
	} catch (error) {
		console.error("Save paper error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
