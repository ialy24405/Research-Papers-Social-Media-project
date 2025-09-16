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
		console.log("Upload API received body:", req.body);
		console.log("Content-Type:", req.headers['content-type']);

		const { title, description, categoryId, pdfUrl, aiSummary } = req.body;

		console.log("Parsed data:", {
			title,
			description,
			categoryId,
			pdfUrl,
			aiSummary
		});

		if (!title || !categoryId) {
			console.log("Missing required fields:", { 
				title: !!title, 
				categoryId: !!categoryId,
				titleValue: title,
				categoryIdValue: categoryId
			});
			return res.status(400).json({
				error: "Missing required fields: title and categoryId are required.",
			});
		}

		if (!pdfUrl) {
			return res.status(400).json({
				error: "PDF file is required.",
			});
		}

		// Insert paper into database
		const result = await query(
			`
			INSERT INTO papers (title, description, author_id, category_id, pdf_url, ai_summary, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
			RETURNING id, title, description, author_id, category_id, pdf_url, ai_summary, status, created_at, updated_at
		`,
			[
				title,
				description,
				req.userId,
				categoryId, // Keep as string since category_id is VARCHAR(100)
				pdfUrl,
				aiSummary || null,
			]
		);

		const paper = result.rows[0];

		res.status(201).json({
			message: "Paper uploaded successfully and is pending review",
			paper: {
				id: paper.id,
				title: paper.title,
				description: paper.description,
				pdfUrl: paper.pdf_url,
				categoryId: paper.category_id,
				authorId: paper.author_id,
				aiSummary: paper.ai_summary,
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
