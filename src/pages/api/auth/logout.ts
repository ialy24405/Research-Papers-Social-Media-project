import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// For JWT-based authentication, logout is typically handled client-side
		// by removing the token from localStorage. Server-side logout would require
		// token blacklisting which isn't implemented in this basic setup.

		// If you want to implement server-side token blacklisting,
		// you would need to store invalidated tokens in a database or cache

		res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ error: "Logout failed" });
	}
}
