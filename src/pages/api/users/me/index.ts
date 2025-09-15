import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

	try {
		if (req.method === "GET") {
			// Get user profile
			const result = await query(
				"SELECT id, email, full_name, birth_date, college_name, country, ssn, avatar_url, role, created_at FROM users WHERE id = $1",
				[req.userId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			const user = result.rows[0];
			res.status(200).json({
				id: user.id,
				email: user.email,
				fullName: user.full_name,
				birthDate: user.birth_date,
				collegeName: user.college_name,
				country: user.country,
				ssn: user.ssn,
				avatarUrl: user.avatar_url,
				role: user.role,
				createdAt: user.created_at,
			});
		} else if (req.method === "PUT") {
			// Update user profile
			const {
				fullName,
				birthDate,
				collegeName,
				country,
				ssn,
				avatarUrl,
				currentPassword,
				newPassword,
			} = req.body;

			// If changing password, verify current password
			if (newPassword) {
				if (!currentPassword) {
					return res
						.status(400)
						.json({ error: "Current password required to change password" });
				}

				const userResult = await query(
					"SELECT password_hash FROM users WHERE id = $1",
					[req.userId]
				);

				if (userResult.rows.length === 0) {
					return res.status(404).json({ error: "User not found" });
				}

				const isValidPassword = await bcrypt.compare(
					currentPassword,
					userResult.rows[0].password_hash
				);

				if (!isValidPassword) {
					return res
						.status(400)
						.json({ error: "Current password is incorrect" });
				}
			}

			// Build update query dynamically
			const updates = [];
			const values = [];
			let paramCount = 1;

			if (fullName !== undefined) {
				updates.push(`full_name = $${paramCount++}`);
				values.push(fullName);
			}
			if (birthDate !== undefined) {
				updates.push(`birth_date = $${paramCount++}`);
				values.push(birthDate);
			}
			if (collegeName !== undefined) {
				updates.push(`college_name = $${paramCount++}`);
				values.push(collegeName);
			}
			if (country !== undefined) {
				updates.push(`country = $${paramCount++}`);
				values.push(country);
			}
			if (ssn !== undefined) {
				updates.push(`ssn = $${paramCount++}`);
				values.push(ssn);
			}
			if (avatarUrl !== undefined) {
				updates.push(`avatar_url = $${paramCount++}`);
				values.push(avatarUrl);
			}
			if (newPassword) {
				const hashedPassword = await bcrypt.hash(newPassword, 12);
				updates.push(`password_hash = $${paramCount++}`);
				values.push(hashedPassword);
			}

			if (updates.length === 0) {
				return res.status(400).json({ error: "No fields to update" });
			}

			values.push(req.userId);

			const updateQuery = `
				UPDATE users 
				SET ${updates.join(", ")}
				WHERE id = $${paramCount}
				RETURNING id, email, full_name, birth_date, college_name, country, ssn, avatar_url, role, created_at
			`;

			const result = await query(updateQuery, values);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			const user = result.rows[0];
			res.status(200).json({
				message: "Profile updated successfully",
				user: {
					id: user.id,
					email: user.email,
					fullName: user.full_name,
					birthDate: user.birth_date,
					collegeName: user.college_name,
					country: user.country,
					ssn: user.ssn,
					avatarUrl: user.avatar_url,
					role: user.role,
					createdAt: user.created_at,
				},
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("User profile error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
