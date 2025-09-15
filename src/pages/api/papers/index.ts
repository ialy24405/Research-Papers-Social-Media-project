import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const result = await query(`
      SELECT p.*, u.full_name as author_name, c.name as category_name 
      FROM papers p 
      JOIN users u ON p.author_id = u.id 
      JOIN categories c ON p.category_id = c.id 
      WHERE p.status = 'approved'
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

		res.status(200).json(result.rows);
	} catch (error) {
		console.error("Papers fetch error:", error);
		// Return empty array if database fails
		res.status(200).json([]);
	}
}
