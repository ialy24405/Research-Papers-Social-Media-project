import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
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
		const { email, username, password, firstName, lastName, fullName } =
			req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const finalFullName =
			fullName || `${firstName || ""} ${lastName || ""}`.trim() || "User";
		const finalUsername =
			username || email.split("@")[0] + Math.floor(Math.random() * 1000);

		// Check if user exists
		const existingUser = await query(
			"SELECT id FROM users WHERE email = $1 OR username = $2",
			[email, finalUsername]
		);

		if (existingUser.rows.length > 0) {
			return res
				.status(409)
				.json({ error: "User with this email or username already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user
		const result = await query(
			`INSERT INTO users (email, username, password, first_name, last_name, full_name) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, username, full_name, role, created_at`,
			[
				email,
				finalUsername,
				hashedPassword,
				firstName || "",
				lastName || "",
				finalFullName,
			]
		);

		const user = result.rows[0];

		// Generate JWT
		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET!,
			{ expiresIn: "24h" }
		);

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				fullName: user.full_name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res
			.status(500)
			.json({
				error: "Internal server error",
				details:
					process.env.NODE_ENV === "development"
						? (error as Error).message
						: undefined,
			});
	}
}
