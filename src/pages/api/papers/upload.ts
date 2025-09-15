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
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { title, abstract, content, categoryId, fileUrl } = req.body;

		if (!title || !abstract || !categoryId) {
			return res.status(400).json({
				error: "Missing required fields: title, abstract, or categoryId",
			});
		}

		// Insert paper into database
		const result = await query(
			`
			INSERT INTO papers (title, abstract, content, file_url, category_id, author_id, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
			RETURNING id, title, abstract, content, file_url, category_id, author_id, status, created_at, updated_at
		`,
			[
				title,
				abstract,
				content,
				fileUrl || null,
				parseInt(categoryId),
				req.userId,
			]
		);

		const paper = result.rows[0];

		res.status(201).json({
			message: "Paper uploaded successfully and is pending review",
			paper: {
				id: paper.id,
				title: paper.title,
				abstract: paper.abstract,
				content: paper.content,
				fileUrl: paper.file_url,
				categoryId: paper.category_id,
				authorId: paper.author_id,
				status: paper.status,
				createdAt: paper.created_at,
				updatedAt: paper.updated_at,
			},
		});
	} catch (error) {
		console.error("Paper upload error:", error);
		res.status(500).json({ error: "Failed to upload paper" });
	}
}
