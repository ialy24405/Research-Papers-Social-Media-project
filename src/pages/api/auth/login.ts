import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { email, password } = req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		// Find user
		const result = await query(
			"SELECT id, email, password_hash as password, full_name, role FROM users WHERE email = $1",
			[email]
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const user = result.rows[0];

		// Verify password
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Generate JWT
		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET!,
			{ expiresIn: "24h" }
		);

		res.status(200).json({
			message: "Login successful",
			token,
			user: {
				id: user.id,
				email: user.email,
				fullName: user.full_name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
