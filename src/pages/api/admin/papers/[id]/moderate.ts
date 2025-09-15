import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/database";
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
	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// Check admin access
	if (!(await checkAdminAccess(req))) {
		return res.status(403).json({ error: "Admin access required" });
	}

	if (req.method !== "PATCH") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { id } = req.query;
	const paperId = parseInt(id as string);
	const { action, reason } = req.body;

	if (!paperId || isNaN(paperId)) {
		return res.status(400).json({ error: "Invalid paper ID" });
	}

	if (!action || !["approve", "reject"].includes(action)) {
		return res
			.status(400)
			.json({ error: "Invalid action. Must be 'approve' or 'reject'" });
	}

	try {
		// Check if paper exists
		const paperCheck = await query(
			"SELECT id, status FROM papers WHERE id = $1",
			[paperId]
		);
		if (paperCheck.rows.length === 0) {
			return res.status(404).json({ error: "Paper not found" });
		}

		const newStatus = action === "approve" ? "approved" : "rejected";

		// Update paper status
		await query(
			"UPDATE papers SET status = $1, updated_at = NOW() WHERE id = $2",
			[newStatus, paperId]
		);

		// If rejected and reason provided, could store in a separate table or field
		// For now, just update the status

		const message =
			action === "approve"
				? "Paper approved successfully"
				: `Paper rejected${reason ? `: ${reason}` : ""}`;

		res.status(200).json({ message });
	} catch (error) {
		console.error("Moderate paper error:", error);
		res.status(500).json({ error: "Failed to moderate paper" });
	}
}
