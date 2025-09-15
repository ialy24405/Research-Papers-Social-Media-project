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
		const { email, password, fullName, birthDate, collegeName, country, ssn } =
			req.body;

		// Validation
		if (
			!email ||
			!password ||
			!fullName ||
			!birthDate ||
			!collegeName ||
			!country ||
			!ssn
		) {
			return res
				.status(400)
				.json({ error: "All required fields must be provided" });
		}

		// Check if user exists
		const existingUser = await query("SELECT id FROM users WHERE email = $1", [
			email,
		]);

		if (existingUser.rows.length > 0) {
			return res
				.status(409)
				.json({ error: "User with this email already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create user
		const result = await query(
			`INSERT INTO users (full_name, email, password_hash, birth_date, college_name, country, ssn) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, full_name, role, created_at`,
			[fullName, email, hashedPassword, birthDate, collegeName, country, ssn]
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
				fullName: user.full_name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
