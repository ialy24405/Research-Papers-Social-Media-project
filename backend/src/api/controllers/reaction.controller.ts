import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ReactionModel } from "../models/reaction.model";

export class ReactionController {
	/**
	 * Toggle a reaction on a paper
	 * POST /api/reactions/toggle
	 */
	static async toggleReaction(req: AuthRequest, res: Response) {
		try {
			const { paperId, reactionType } = req.body;
			const userId = req.user?.id; // Assumes auth middleware sets req.user

			// Validate input
			if (!paperId || !reactionType) {
				return res.status(400).json({
					success: false,
					message: "Paper ID and reaction type are required",
				});
			}

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Authentication required",
				});
			}

			const validReactionTypes = ["like", "love", "support", "insightful"];
			if (!validReactionTypes.includes(reactionType)) {
				return res.status(400).json({
					success: false,
					message: "Invalid reaction type",
				});
			}

			// Toggle the reaction
			const result = await ReactionModel.toggleReaction(
				paperId,
				userId,
				reactionType
			);

			// Get updated stats
			const stats = await ReactionModel.getReactionStats(paperId);
			const userReaction = await ReactionModel.getUserReaction(paperId, userId);

			res.json({
				success: true,
				action: result.action,
				reaction: result.reaction,
				stats,
				userReaction: userReaction.reaction_type,
			});
		} catch (error) {
			console.error("Error toggling reaction:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get reaction statistics for a paper
	 * GET /api/reactions/stats/:paperId
	 */
	static async getReactionStats(req: AuthRequest, res: Response) {
		try {
			const { paperId } = req.params;

			if (!paperId || isNaN(Number(paperId))) {
				return res.status(400).json({
					success: false,
					message: "Valid paper ID is required",
				});
			}

			const stats = await ReactionModel.getReactionStats(Number(paperId));

			// Format stats into a more user-friendly structure
			const formattedStats = {
				like: 0,
				love: 0,
				support: 0,
				insightful: 0,
				total: 0,
			};

			stats.forEach((stat) => {
				formattedStats[stat.reaction_type as keyof typeof formattedStats] =
					Number(stat.count);
				formattedStats.total += Number(stat.count);
			});

			res.json({
				success: true,
				paperId: Number(paperId),
				stats: formattedStats,
			});
		} catch (error) {
			console.error("Error getting reaction stats:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get user's reaction for a paper
	 * GET /api/reactions/user/:paperId
	 */
	static async getUserReaction(req: AuthRequest, res: Response) {
		try {
			const { paperId } = req.params;
			const userId = req.user?.id;

			if (!paperId || isNaN(Number(paperId))) {
				return res.status(400).json({
					success: false,
					message: "Valid paper ID is required",
				});
			}

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Authentication required",
				});
			}

			const userReaction = await ReactionModel.getUserReaction(
				Number(paperId),
				userId
			);

			res.json({
				success: true,
				paperId: Number(paperId),
				userId,
				reactionType: userReaction.reaction_type,
			});
		} catch (error) {
			console.error("Error getting user reaction:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get reaction statistics for multiple papers
	 * POST /api/reactions/stats/bulk
	 */
	static async getBulkReactionStats(req: AuthRequest, res: Response) {
		try {
			const { paperIds } = req.body;

			if (!Array.isArray(paperIds) || paperIds.length === 0) {
				return res.status(400).json({
					success: false,
					message: "Array of paper IDs is required",
				});
			}

			// Validate all paper IDs are numbers
			const validPaperIds = paperIds
				.filter((id) => !isNaN(Number(id)))
				.map(Number);

			if (validPaperIds.length === 0) {
				return res.status(400).json({
					success: false,
					message: "No valid paper IDs provided",
				});
			}

			const stats = await ReactionModel.getMultipleReactionStats(validPaperIds);

			// Group stats by paper ID
			const groupedStats: Record<number, any> = {};

			validPaperIds.forEach((paperId) => {
				groupedStats[paperId] = {
					like: 0,
					love: 0,
					support: 0,
					insightful: 0,
					total: 0,
				};
			});

			stats.forEach((stat) => {
				if (groupedStats[stat.paper_id]) {
					groupedStats[stat.paper_id][stat.reaction_type] = Number(stat.count);
					groupedStats[stat.paper_id].total += Number(stat.count);
				}
			});

			res.json({
				success: true,
				stats: groupedStats,
			});
		} catch (error) {
			console.error("Error getting bulk reaction stats:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get user's reactions for multiple papers
	 * POST /api/reactions/user/bulk
	 */
	static async getBulkUserReactions(req: AuthRequest, res: Response) {
		try {
			const { paperIds } = req.body;
			const userId = req.user?.id;

			if (!Array.isArray(paperIds) || paperIds.length === 0) {
				return res.status(400).json({
					success: false,
					message: "Array of paper IDs is required",
				});
			}

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Authentication required",
				});
			}

			// Validate all paper IDs are numbers
			const validPaperIds = paperIds
				.filter((id) => !isNaN(Number(id)))
				.map(Number);

			if (validPaperIds.length === 0) {
				return res.status(400).json({
					success: false,
					message: "No valid paper IDs provided",
				});
			}

			const userReactions = await ReactionModel.getMultipleUserReactions(
				validPaperIds,
				userId
			);

			// Convert to object for easier lookup
			const reactionsMap: Record<number, string | null> = {};
			userReactions.forEach((reaction) => {
				reactionsMap[reaction.paper_id] = reaction.reaction_type;
			});

			res.json({
				success: true,
				userId,
				reactions: reactionsMap,
			});
		} catch (error) {
			console.error("Error getting bulk user reactions:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get all reactions for a paper with user details
	 * GET /api/reactions/paper/:paperId/details
	 */
	static async getPaperReactionDetails(req: AuthRequest, res: Response) {
		try {
			const { paperId } = req.params;

			if (!paperId || isNaN(Number(paperId))) {
				return res.status(400).json({
					success: false,
					message: "Valid paper ID is required",
				});
			}

			const reactions = await ReactionModel.getPaperReactionsWithUsers(
				Number(paperId)
			);

			res.json({
				success: true,
				paperId: Number(paperId),
				reactions,
			});
		} catch (error) {
			console.error("Error getting paper reaction details:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}

	/**
	 * Get trending papers based on reactions
	 * GET /api/reactions/trending
	 */
	static async getTrendingPapers(req: AuthRequest, res: Response) {
		try {
			const limit = Math.min(Number(req.query.limit) || 10, 50); // Max 50 papers
			const days = Math.min(Number(req.query.days) || 7, 30); // Max 30 days

			const trendingPapers = await ReactionModel.getTrendingPapers(limit, days);

			res.json({
				success: true,
				limit,
				days,
				papers: trendingPapers,
			});
		} catch (error) {
			console.error("Error getting trending papers:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}
}
