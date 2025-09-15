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
	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	const paperId = parseInt(id, 10);
	if (isNaN(paperId)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	try {
		if (req.method === "GET") {
			// Get single paper details
			const result = await query(
				`SELECT 
					p.id, p.title, p.description, p.pdf_url, p.ai_summary, p.status, 
					p.rejection_reason, p.created_at, p.updated_at,
					u.id as author_id, u.full_name as author_name,
					c.id as category_id, c.name as category_name,
					approved.full_name as approved_by_name
				FROM papers p
				JOIN users u ON p.author_id = u.id
				JOIN categories c ON p.category_id = c.id
				LEFT JOIN users approved ON p.approved_by_id = approved.id
				WHERE p.id = $1`,
				[paperId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Paper not found" });
			}

			const paper = result.rows[0];
			res.status(200).json({
				id: paper.id,
				title: paper.title,
				description: paper.description,
				pdfUrl: paper.pdf_url,
				aiSummary: paper.ai_summary,
				status: paper.status,
				rejectionReason: paper.rejection_reason,
				createdAt: paper.created_at,
				updatedAt: paper.updated_at,
				author: {
					id: paper.author_id,
					name: paper.author_name,
				},
				category: {
					id: paper.category_id,
					name: paper.category_name,
				},
				approvedBy: paper.approved_by_name,
			});
		} else if (req.method === "DELETE") {
			// Delete paper (only by author or admin)
			if (!authenticateToken(req)) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			// Check if paper exists and get author info
			const paperResult = await query(
				"SELECT author_id FROM papers WHERE id = $1",
				[paperId]
			);

			if (paperResult.rows.length === 0) {
				return res.status(404).json({ error: "Paper not found" });
			}

			const paper = paperResult.rows[0];

			// Check if user is author or admin
			const userResult = await query("SELECT role FROM users WHERE id = $1", [
				req.userId,
			]);

			if (userResult.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			const user = userResult.rows[0];
			const isAuthor = paper.author_id === req.userId;
			const isAdmin = user.role === "admin" || user.role === "owner";

			if (!isAuthor && !isAdmin) {
				return res
					.status(403)
					.json({ error: "You can only delete your own papers" });
			}

			// Delete the paper
			await query("DELETE FROM papers WHERE id = $1", [paperId]);

			res.status(200).json({ message: "Paper deleted successfully" });
		} else if (req.method === "PUT") {
			// Update paper (for admin actions like approve/reject)
			if (!authenticateToken(req)) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const { status, rejectionReason } = req.body;

			// Check if user is admin
			const userResult = await query("SELECT role FROM users WHERE id = $1", [
				req.userId,
			]);

			if (userResult.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			const user = userResult.rows[0];
			const isAdmin = user.role === "admin" || user.role === "owner";

			if (!isAdmin) {
				return res.status(403).json({ error: "Admin access required" });
			}

			// Update paper status
			const result = await query(
				`UPDATE papers 
				SET status = $1, rejection_reason = $2, approved_by_id = $3
				WHERE id = $4
				RETURNING *`,
				[status, rejectionReason || null, req.userId, paperId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "Paper not found" });
			}

			res.status(200).json({
				message: "Paper updated successfully",
				paper: result.rows[0],
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Paper management error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
