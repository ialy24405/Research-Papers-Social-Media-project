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

	if (!id || typeof id !== "string") {
		return res.status(400).json({ error: "Paper ID is required" });
	}

	try {
		console.log("📄 Serving PDF for paper ID:", id);

		// Get paper info including file path
		const paperResult = await query(
			`SELECT id, title, pdf_url, status FROM papers WHERE id = $1`,
			[id]
		);

		if (paperResult.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		const paper = paperResult.rows[0];

		// For now, return paper info - in production, you'd serve the actual file
		// This endpoint can be extended to serve files from cloud storage
		res.status(200).json({
			message: "PDF file endpoint",
			paper: {
				id: paper.id,
				title: paper.title,
				pdfUrl: paper.pdf_url,
				status: paper.status,
			},
			note: "In production, this would serve the actual PDF file from cloud storage",
		});
	} catch (error) {
		console.error("❌ Error serving PDF:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development" ? String(error) : undefined,
		});
	}
}