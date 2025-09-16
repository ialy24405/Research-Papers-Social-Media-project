import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends NextApiRequest {
	userId?: number;
	userRole?: string;
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

const checkAdminAccess = async (
	req: AuthenticatedRequest
): Promise<boolean> => {
	if (!req.userId) return false;

	try {
		const result = await query("SELECT role FROM users WHERE id = $1", [
			req.userId,
		]);

		if (result.rows.length === 0) return false;

		const userRole = result.rows[0].role;
		req.userRole = userRole;
		return userRole === "admin" || userRole === "owner";
	} catch (error) {
		return false;
	}
};

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	console.log("Role change request:", {
		method: req.method,
		query: req.query,
		body: req.body,
		headers: req.headers.authorization ? "Bearer token present" : "No token",
	});

	// Authenticate user
	if (!authenticateToken(req)) {
		console.log("Authentication failed");
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Check admin access
	if (!(await checkAdminAccess(req))) {
		console.log("Admin access check failed");
		return res.status(403).json({ error: "Admin access required" });
	}

	if (req.method !== "PATCH") {
		console.log("Invalid method:", req.method);
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { id } = req.query;
	const userId = parseInt(id as string);
	const { role } = req.body;

	if (!userId || isNaN(userId)) {
		return res.status(400).json({ error: "Invalid user ID" });
	}

	if (!role || !["user", "admin", "owner"].includes(role)) {
		return res
			.status(400)
			.json({ error: "Invalid role. Must be 'user', 'admin', or 'owner'" });
	}

	try {
		// Check if user exists
		const userCheck = await query("SELECT id, role FROM users WHERE id = $1", [
			userId,
		]);
		if (userCheck.rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		// Prevent changing owner role
		const currentRole = userCheck.rows[0].role;
		if (currentRole === "owner") {
			return res.status(403).json({ error: "Cannot change owner role" });
		}

		// Only owner can promote to admin
		if (role === "admin" && req.userRole !== "owner") {
			return res
				.status(403)
				.json({ error: "Only owner can promote users to admin" });
		}

		// Update user role
		await query(
			"UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2",
			[role, userId]
		);

		res.status(200).json({ message: `User role updated to ${role}` });
	} catch (error) {
		console.error("Update user role error:", error);
		res.status(500).json({ error: "Failed to update user role" });
	}
}
