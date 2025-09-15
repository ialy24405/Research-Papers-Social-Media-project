import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const result = await query("SELECT * FROM categories ORDER BY name");
		res.status(200).json(result.rows);
	} catch (error) {
		console.error("Categories fetch error:", error);
		// Return default categories if database fails
		res.status(200).json([
			{
				id: "computer-science",
				name: "Computer Science",
				description: "Computing and software",
			},
			{
				id: "mathematics",
				name: "Mathematics",
				description: "Mathematical research",
			},
			{ id: "physics", name: "Physics", description: "Physics research" },
			{ id: "biology", name: "Biology", description: "Biological sciences" },
		]);
	}
}
