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

	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Get user's own papers with category information
		const result = await query(
			`
			SELECT p.*, c.name as category_name,
				CASE 
					WHEN p.status = 'approved' THEN 'approved'
					WHEN p.status = 'pending' THEN 'pending'
					WHEN p.status = 'rejected' THEN 'rejected'
					ELSE 'draft'
				END as status
			FROM papers p 
			LEFT JOIN categories c ON p.category_id = c.id 
			WHERE p.author_id = $1
			ORDER BY p.created_at DESC
		`,
			[req.userId]
		);

		// Transform the data to match frontend expectations
		const papers = result.rows.map((row) => ({
			id: row.id,
			title: row.title,
			abstract: row.abstract,
			content: row.content,
			fileUrl: row.file_url,
			categoryId: row.category_id,
			categoryName: row.category_name,
			status: row.status,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			authorId: row.author_id,
		}));

		res.status(200).json(papers);
	} catch (error) {
		console.error("User papers fetch error:", error);
		// Return empty array instead of error to prevent frontend crashes
		res.status(200).json([]);
	}
}
