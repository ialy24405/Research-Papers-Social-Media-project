import { db } from "../../config/db";

export interface Reaction {
	id: number;
	paper_id: number;
	user_id: number;
	reaction_type: "like" | "love" | "support" | "insightful";
	created_at: Date;
	updated_at: Date;
}

export interface CreateReactionData {
	paperId: number;
	userId: number;
	reactionType: "like" | "love" | "support" | "insightful";
}

export interface ReactionStats {
	paper_id: number;
	reaction_type: "like" | "love" | "support" | "insightful";
	count: number;
}

export interface UserReaction {
	paper_id: number;
	user_id: number;
	reaction_type: "like" | "love" | "support" | "insightful" | null;
}

export class ReactionModel {
	/**
	 * Toggle a user's reaction on a paper
	 * If the user already has the same reaction, remove it
	 * If the user has a different reaction, update it
	 * If the user has no reaction, add it
	 */
	static async toggleReaction(
		paperId: number,
		userId: number,
		reactionType: Reaction["reaction_type"]
	): Promise<{
		success: boolean;
		action: "added" | "removed" | "updated";
		reaction: Reaction | null;
	}> {
		const client = await db.getClient();

		try {
			await client.query("BEGIN");

			// Check if user already has a reaction on this paper
			const existingReactionQuery = `
				SELECT * FROM paper_reactions 
				WHERE paper_id = $1 AND user_id = $2
			`;
			const existingResult = await client.query(existingReactionQuery, [
				paperId,
				userId,
			]);
			const existingReaction = existingResult.rows[0];

			let action: "added" | "removed" | "updated";
			let reaction: Reaction | null = null;

			if (existingReaction) {
				if (existingReaction.reaction_type === reactionType) {
					// Same reaction type - remove it
					const deleteQuery = `
						DELETE FROM paper_reactions 
						WHERE paper_id = $1 AND user_id = $2
					`;
					await client.query(deleteQuery, [paperId, userId]);
					action = "removed";
				} else {
					// Different reaction type - update it
					const updateQuery = `
						UPDATE paper_reactions 
						SET reaction_type = $1, updated_at = NOW()
						WHERE paper_id = $2 AND user_id = $3
						RETURNING *
					`;
					const updateResult = await client.query(updateQuery, [
						reactionType,
						paperId,
						userId,
					]);
					reaction = updateResult.rows[0];
					action = "updated";
				}
			} else {
				// No existing reaction - add new one
				const insertQuery = `
					INSERT INTO paper_reactions (paper_id, user_id, reaction_type)
					VALUES ($1, $2, $3)
					RETURNING *
				`;
				const insertResult = await client.query(insertQuery, [
					paperId,
					userId,
					reactionType,
				]);
				reaction = insertResult.rows[0];
				action = "added";
			}

			await client.query("COMMIT");
			return { success: true, action, reaction };
		} catch (error) {
			await client.query("ROLLBACK");
			console.error("Error toggling reaction:", error);
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * Get reaction statistics for a paper
	 */
	static async getReactionStats(paperId: number): Promise<ReactionStats[]> {
		const query = `
			SELECT 
				paper_id,
				reaction_type,
				COUNT(*) as count
			FROM paper_reactions 
			WHERE paper_id = $1
			GROUP BY paper_id, reaction_type
			ORDER BY reaction_type
		`;

		const result = await db.query(query, [paperId]);
		return result.rows;
	}

	/**
	 * Get reaction statistics for multiple papers
	 */
	static async getMultipleReactionStats(
		paperIds: number[]
	): Promise<ReactionStats[]> {
		if (paperIds.length === 0) return [];

		const query = `
			SELECT 
				paper_id,
				reaction_type,
				COUNT(*) as count
			FROM paper_reactions 
			WHERE paper_id = ANY($1)
			GROUP BY paper_id, reaction_type
			ORDER BY paper_id, reaction_type
		`;

		const result = await db.query(query, [paperIds]);
		return result.rows;
	}

	/**
	 * Get user's reaction for a specific paper
	 */
	static async getUserReaction(
		paperId: number,
		userId: number
	): Promise<UserReaction> {
		const query = `
			SELECT 
				paper_id,
				user_id,
				reaction_type
			FROM paper_reactions 
			WHERE paper_id = $1 AND user_id = $2
		`;

		const result = await db.query(query, [paperId, userId]);
		const reaction = result.rows[0];

		return {
			paper_id: paperId,
			user_id: userId,
			reaction_type: reaction ? reaction.reaction_type : null,
		};
	}

	/**
	 * Get user's reactions for multiple papers
	 */
	static async getMultipleUserReactions(
		paperIds: number[],
		userId: number
	): Promise<UserReaction[]> {
		if (paperIds.length === 0) return [];

		const query = `
			SELECT 
				paper_id,
				user_id,
				reaction_type
			FROM paper_reactions 
			WHERE paper_id = ANY($1) AND user_id = $2
		`;

		const result = await db.query(query, [paperIds, userId]);
		const reactions = result.rows;

		// Create a map of paper_id to reaction_type
		const reactionMap = new Map();
		reactions.forEach((r: any) => {
			reactionMap.set(r.paper_id, r.reaction_type);
		});

		// Return array with null for papers without reactions
		return paperIds.map((paperId) => ({
			paper_id: paperId,
			user_id: userId,
			reaction_type: reactionMap.get(paperId) || null,
		}));
	}

	/**
	 * Get all reactions for a paper with user details
	 */
	static async getPaperReactionsWithUsers(paperId: number): Promise<any[]> {
		const query = `
			SELECT 
				pr.*,
				u.full_name,
				u.avatar_url
			FROM paper_reactions pr
			JOIN users u ON pr.user_id = u.id
			WHERE pr.paper_id = $1
			ORDER BY pr.created_at DESC
		`;

		const result = await db.query(query, [paperId]);
		return result.rows;
	}

	/**
	 * Remove all reactions for a paper (cleanup function)
	 */
	static async removeAllReactions(paperId: number): Promise<boolean> {
		try {
			const query = `DELETE FROM paper_reactions WHERE paper_id = $1`;
			await db.query(query, [paperId]);
			return true;
		} catch (error) {
			console.error("Error removing reactions:", error);
			return false;
		}
	}

	/**
	 * Get trending papers based on recent reactions
	 */
	static async getTrendingPapers(
		limit: number = 10,
		days: number = 7
	): Promise<any[]> {
		const query = `
			SELECT 
				p.id,
				p.title,
				COUNT(pr.id) as recent_reactions
			FROM papers p
			LEFT JOIN paper_reactions pr ON p.id = pr.paper_id
			WHERE pr.created_at >= NOW() - INTERVAL '${days} days'
			GROUP BY p.id, p.title
			ORDER BY recent_reactions DESC
			LIMIT $1
		`;

		const result = await db.query(query, [limit]);
		return result.rows;
	}
}
