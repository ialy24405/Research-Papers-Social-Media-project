import { Response } from "express";
import { PaperModel } from "../models/paper.model";
import { UserModel } from "../models/user.model";
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
				pdfUrl: paper.pdf_url,
				category: {
					id: paper.category_id,
					name: paper.category_name,
				},
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

	static async getRecentInteractions(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const limit = parseInt(req.query.limit as string) || 20;
			const interactions = await UserModel.getRecentInteractions(
				req.user.id,
				limit
			);

			const response = interactions.map((interaction: any) => ({
				id: `${interaction.interaction_type}-${interaction.paper_id}-${interaction.created_at}`,
				type: interaction.interaction_type,
				action: interaction.action,
				createdAt: interaction.created_at,
				paper: {
					id: interaction.paper_id,
					title: interaction.paper_title,
					author: {
						id: interaction.paper_author_id,
						name: interaction.paper_author_name,
					},
					category: interaction.category_name,
				},
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Get recent interactions error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async updateProfile(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const { fullName, collegeName, country, avatarUrl } = req.body;

			// Validate input
			if (!fullName || fullName.trim().length < 2) {
				return res
					.status(400)
					.json({ error: "Full name must be at least 2 characters" });
			}

			if (!collegeName || collegeName.trim().length < 2) {
				return res
					.status(400)
					.json({ error: "College name must be at least 2 characters" });
			}

			if (!country || country.trim().length < 2) {
				return res
					.status(400)
					.json({ error: "Country must be at least 2 characters" });
			}

			// Prepare updates object
			const updates: any = {
				full_name: fullName.trim(),
				college_name: collegeName.trim(),
				country: country.trim(),
			};

			// Only update avatar URL if provided
			if (avatarUrl !== undefined) {
				updates.avatar_url = avatarUrl || null;
			}

			// Update user profile
			await UserModel.updateUser(req.user.id, updates);

			// Return success response
			res.status(200).json({ message: "Profile updated successfully" });
		} catch (error) {
			console.error("Update profile error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
