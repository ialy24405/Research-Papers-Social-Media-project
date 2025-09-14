import { Response } from "express";
import { PaperModel } from "../models/paper.model";
import { AuthRequest } from "../middleware/auth.middleware";

export class UserController {
	static async getCurrentUser(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			// Return the user data from the auth middleware with proper serialization
			const userResponse = {
				id: req.user.id,
				fullName: req.user.fullName,
				email: req.user.email,
				birthDate: req.user.birthDate.toISOString(),
				collegeName: req.user.collegeName,
				country: req.user.country,
				ssn: req.user.ssn,
				avatarUrl: req.user.avatarUrl,
				role: req.user.role,
				createdAt: req.user.createdAt.toISOString(),
			};

			res.status(200).json(userResponse);
		} catch (error) {
			console.error("Get current user error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
	static async getUserPapers(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const papers = await PaperModel.findByAuthor(req.user.id);

			const response = papers.map((paper) => ({
				id: paper.id,
				name: paper.title,
				status: paper.status,
				rejectionReason: paper.rejection_reason,
				createdAt: paper.created_at,
				interactions: {
					reactions: paper.reaction_count || 0,
					comments: paper.comment_count || 0,
					saves: paper.save_count || 0,
				},
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Get user papers error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async getSavedPapers(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const papers = await PaperModel.getSavedPapers(req.user.id);

			const response = papers.map((paper) => ({
				id: paper.id,
				name: paper.title,
				description: paper.description,
				authorName: paper.author_name,
				authorAvatar: paper.author_avatar,
				createdAt: paper.created_at,
				interactions: {
					reactions: paper.reaction_count,
					comments: paper.comment_count,
					saves: paper.save_count,
				},
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Get saved papers error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
