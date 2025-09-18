import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	console.log("🧪 Database test API called");

	try {
		// Simple query to test database connection
		const result = await query(
			"SELECT 1 as test_number, NOW() as current_time"
		);

		console.log("✅ Database connection successful");

		res.status(200).json({
			message: "Database connection successful",
			result: result.rows[0],
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("❌ Database connection failed:", error);

		res.status(500).json({
			error: "Database connection failed",
			details:
				process.env.NODE_ENV === "development"
					? String(error)
					: "Internal error",
			timestamp: new Date().toISOString(),
		});
	}
}
