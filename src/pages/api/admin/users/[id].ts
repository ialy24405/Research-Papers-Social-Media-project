import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
import jwt from "jsonwebtoken";

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

const isAdmin = async (userId: number): Promise<boolean> => {
	const result = await query("SELECT role FROM users WHERE id = $1", [userId]);

	if (result.rows.length === 0) {
		return false;
	}

	const userRole = result.rows[0].role;
	return userRole === "admin" || userRole === "owner";
};

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Check admin permissions
	if (!(await isAdmin(req.userId!))) {
		return res.status(403).json({ error: "Admin access required" });
	}

	const { id } = req.query;

	if (!id || Array.isArray(id)) {
		return res.status(400).json({ error: "Invalid user ID" });
	}

	const targetUserId = parseInt(id, 10);
	if (isNaN(targetUserId)) {
		return res.status(400).json({ error: "Invalid user ID" });
	}

	try {
		if (req.method === "GET") {
			// Get specific user details
			const result = await query(
				`SELECT 
					id, email, full_name, birth_date, college_name, country, ssn,
					avatar_url, role, created_at
				FROM users WHERE id = $1`,
				[targetUserId]
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
			// Update user (role change)
			const { role } = req.body;

			if (!role) {
				return res.status(400).json({ error: "Role is required" });
			}

			const validRoles = ["user", "admin", "owner"];
			if (!validRoles.includes(role)) {
				return res.status(400).json({
					error: "Invalid role",
					validRoles,
				});
			}

			// Prevent self-demotion from owner
			if (req.userId === targetUserId) {
				const currentUser = await query(
					"SELECT role FROM users WHERE id = $1",
					[req.userId]
				);

				if (currentUser.rows[0].role === "owner" && role !== "owner") {
					return res.status(400).json({
						error: "Cannot demote yourself from owner role",
					});
				}
			}

			const result = await query(
				`UPDATE users 
				SET role = $1
				WHERE id = $2
				RETURNING id, email, full_name, role, created_at`,
				[role, targetUserId]
			);

			if (result.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			res.status(200).json({
				message: "User role updated successfully",
				user: result.rows[0],
			});
		} else if (req.method === "DELETE") {
			// Delete user
			// Check if trying to delete self
			if (req.userId === targetUserId) {
				return res.status(400).json({
					error: "Cannot delete your own account",
				});
			}

			// Check if target user exists
			const userCheck = await query(
				"SELECT id, role FROM users WHERE id = $1",
				[targetUserId]
			);

			if (userCheck.rows.length === 0) {
				return res.status(404).json({ error: "User not found" });
			}

			// Prevent deletion of other owners
			if (userCheck.rows[0].role === "owner") {
				return res.status(400).json({
					error: "Cannot delete owner accounts",
				});
			}

			// Delete the user (cascade will handle related data)
			await query("DELETE FROM users WHERE id = $1", [targetUserId]);

			res.status(200).json({
				message: "User deleted successfully",
			});
		} else {
			res.status(405).json({ error: "Method not allowed" });
		}
	} catch (error) {
		console.error("Admin user management error:", error);
		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development"
					? (error as Error).message
					: undefined,
		});
	}
}
