import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		res.status(200).json({
			status: "OK",
			timestamp: new Date().toISOString(),
			message: "Papers Social Media API is running",
			endpoints: [
				"/api/auth/register",
				"/api/auth/login",
				"/api/categories",
				"/api/papers",
			],
		});
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
