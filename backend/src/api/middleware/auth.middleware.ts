import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { config } from "../../config";
import { UserModel } from "../models/user.model";

export interface AuthRequest extends Request {
	user?: {
		id: number;
		email: string;
		role: string;
		fullName: string;
	};
	file?: any;
}

export async function authMiddleware(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	try {
		const token = req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			return res
				.status(401)
				.json({ error: "Access denied. No token provided." });
		}

		const decoded = jwt.verify(token, config.jwt.secret) as any;

		// Get user from database to ensure they still exist
		const user = await UserModel.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ error: "Invalid token. User not found." });
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			fullName: user.full_name,
		};

		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid token." });
	}
}

export function adminMiddleware(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	if (!req.user) {
		return res.status(401).json({ error: "Authentication required." });
	}

	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Admin access required." });
	}

	next();
}
