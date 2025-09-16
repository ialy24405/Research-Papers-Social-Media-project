/**
 * Reaction utilities for papers and content
 */

import { getApiUrl } from "./config";

export interface ReactionData {
	paperId: number;
	userId?: number;
	type: "like" | "love" | "support" | "insightful";
}

/**
 * Get the current user's reaction type for a paper
 * @param paperId - The ID of the paper
 */
export const getUserReactionType = (
	paperId: number
): ReactionData["type"] | null => {
	try {
		const storageKey = `paper_reactions_${paperId}`;
		const reactions = JSON.parse(localStorage.getItem(storageKey) || "[]");
		const userReaction = reactions.find((r: ReactionData) => r.userId === 1);
		return userReaction ? userReaction.type : null;
	} catch {
		return null;
	}
};

/**
 * Toggle a reaction on a paper
 * @param paperId - The ID of the paper to react to
 * @param reactionType - The type of reaction
 * @param options - Additional options
 */
export const togglePaperReaction = async (
	paperId: number,
	reactionType: ReactionData["type"] = "like",
	options: {
		showAlert?: boolean;
		optimistic?: boolean;
	} = {}
) => {
	const { showAlert = false, optimistic = true } = options;

	try {
		// Get authentication token (check both possible storage keys)
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");

		// Debug logging
		console.log("🔄 Attempting to toggle reaction:", {
			paperId,
			reactionType,
			hasToken: !!token,
		});

		// Try to make API call to backend
		const response = await fetch(getApiUrl("/reactions/toggle"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify({
				paperId,
				reactionType,
			}),
		});

		console.log("📡 API response:", {
			status: response.status,
			ok: response.ok,
		});

		if (response.ok) {
			const result = await response.json();
			console.log("✅ API success:", result);

			// Dispatch custom event to update UI
			window.dispatchEvent(
				new CustomEvent("paperReactionChanged", {
					detail: {
						paperId,
						reactionType: result.userReaction,
						stats: result.stats,
						action: result.action,
					},
				})
			);

			if (showAlert) {
				const actionText = result.action === "removed" ? "Removed" : "Added";
				alert(`${actionText} ${reactionType} reaction!`);
			}

			return {
				success: true,
				action: result.action,
				userReaction: result.userReaction,
				stats: result.stats,
			};
		} else {
			const errorText = await response.text();
			console.error("❌ API error:", { status: response.status, errorText });

			// Check if it's an authentication error
			if (response.status === 401) {
				console.warn("User not authenticated, using localStorage fallback");
				if (showAlert) {
					alert(
						"Please log in to save your reactions permanently. Your reaction is saved locally for now."
					);
				}
			} else {
				console.warn("Backend not available, using localStorage fallback");
			}
			return await togglePaperReactionLocal(paperId, reactionType, options);
		}
	} catch (error) {
		console.warn("API call failed, using localStorage fallback:", error);
		// Fallback to localStorage on error
		return await togglePaperReactionLocal(paperId, reactionType, options);
	}
};

/**
 * Local storage fallback for reaction toggling
 * @param paperId - The ID of the paper to react to
 * @param reactionType - The type of reaction
 * @param options - Additional options
 */
const togglePaperReactionLocal = async (
	paperId: number,
	reactionType: ReactionData["type"] = "like",
	options: {
		showAlert?: boolean;
		optimistic?: boolean;
	} = {}
) => {
	const { showAlert = false } = options;

	try {
		console.log(
			`Toggling ${reactionType} reaction for paper ${paperId} (localStorage)`
		);

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Use localStorage to track reactions
		const storageKey = `paper_reactions_${paperId}`;
		const existingReactions = JSON.parse(
			localStorage.getItem(storageKey) || "[]"
		);

		// Check if user already reacted with this type
		const existingReactionIndex = existingReactions.findIndex(
			(r: ReactionData) => r.type === reactionType && r.userId === 1
		);

		// Remove any existing reactions from this user (only one reaction per user)
		const userReactionIndex = existingReactions.findIndex(
			(r: ReactionData) => r.userId === 1 // Mock user ID
		);

		let newCount = existingReactions.length;
		let isReacted = false;
		let currentUserReaction: ReactionData["type"] | null = null;
		let action: "added" | "removed" | "updated" = "added";

		if (existingReactionIndex >= 0) {
			// User clicked the same reaction type - remove it
			existingReactions.splice(existingReactionIndex, 1);
			newCount--;
			isReacted = false;
			action = "removed";
		} else {
			// Remove existing reaction if user had one
			if (userReactionIndex >= 0) {
				existingReactions.splice(userReactionIndex, 1);
				newCount--;
				action = "updated";
			}

			// Add new reaction
			existingReactions.push({
				paperId,
				type: reactionType,
				userId: 1, // Mock user ID
			});
			newCount++;
			isReacted = true;
			currentUserReaction = reactionType;
		}

		// Save to localStorage
		localStorage.setItem(storageKey, JSON.stringify(existingReactions));

		// Create stats object
		const stats = {
			like: 0,
			love: 0,
			support: 0,
			insightful: 0,
			total: newCount,
		};

		existingReactions.forEach((r: ReactionData) => {
			stats[r.type]++;
		});

		// Dispatch custom event to update UI
		window.dispatchEvent(
			new CustomEvent("paperReactionChanged", {
				detail: {
					paperId,
					reactionType: currentUserReaction,
					stats,
					action,
				},
			})
		);

		if (showAlert) {
			const actionText = action === "removed" ? "Removed" : "Added";
			alert(`${actionText} ${reactionType} reaction!`);
		}

		return {
			success: true,
			action,
			userReaction: currentUserReaction,
			stats,
		};
	} catch (error) {
		console.error("Reaction failed:", error);

		if (showAlert) {
			alert("Failed to update reaction. Please try again.");
		}

		return {
			success: false,
			action: "added" as const,
			userReaction: null,
			stats: { like: 0, love: 0, support: 0, insightful: 0, total: 0 },
		};
	}
};

/**
 * Get the current reaction count for a paper
 * @param paperId - The ID of the paper
 */
export const getPaperReactionCount = (paperId: number): number => {
	try {
		const storageKey = `paper_reactions_${paperId}`;
		const reactions = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return reactions.length;
	} catch {
		return 0;
	}
};

/**
 * Check if the current user has reacted to a paper
 * @param paperId - The ID of the paper
 * @param reactionType - The type of reaction to check
 */
export const hasUserReacted = (
	paperId: number,
	reactionType: ReactionData["type"] = "like"
): boolean => {
	try {
		const storageKey = `paper_reactions_${paperId}`;
		const reactions = JSON.parse(localStorage.getItem(storageKey) || "[]");
		return reactions.some((r: ReactionData) => r.type === reactionType);
	} catch {
		return false;
	}
};

/**
 * Create a reaction handler function for React components
 * @param paperId - The ID of the paper
 * @param reactionType - The type of reaction
 * @param options - Additional options
 */
export const createReactionHandler = (
	paperId: number,
	reactionType: ReactionData["type"] = "like",
	options?: Parameters<typeof togglePaperReaction>[2]
) => {
	return () => togglePaperReaction(paperId, reactionType, options);
};

/**
 * Get reaction statistics from backend or localStorage
 * @param paperId - The ID of the paper
 */
export const getReactionStats = async (
	paperId: number
): Promise<{
	like: number;
	love: number;
	support: number;
	insightful: number;
	total: number;
}> => {
	try {
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");
		const response = await fetch(getApiUrl(`/reactions/stats/${paperId}`), {
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
			},
		});

		if (response.ok) {
			const result = await response.json();
			console.log(
				`📊 Frontend received reaction stats for paper ${paperId}:`,
				result
			);

			// API returns {paperId, reactions, total} directly
			const formattedStats = {
				like: result.reactions?.like || 0,
				love: result.reactions?.love || 0,
				support: result.reactions?.support || 0,
				insightful: result.reactions?.insightful || 0,
				total: result.total || 0,
			};

			console.log(`📊 Formatted reaction stats:`, formattedStats);
			return formattedStats;
		} else {
			// Fallback to localStorage
			return getReactionStatsLocal(paperId);
		}
	} catch (error) {
		console.warn(
			"Failed to fetch reaction stats from API, using localStorage:",
			error
		);
		return getReactionStatsLocal(paperId);
	}
};

/**
 * Get reaction statistics from localStorage
 * @param paperId - The ID of the paper
 */
const getReactionStatsLocal = (paperId: number) => {
	try {
		const storageKey = `paper_reactions_${paperId}`;
		const reactions = JSON.parse(localStorage.getItem(storageKey) || "[]");

		const stats = {
			like: 0,
			love: 0,
			support: 0,
			insightful: 0,
			total: 0,
		};

		reactions.forEach((reaction: ReactionData) => {
			if (reaction.type in stats) {
				stats[reaction.type]++;
				stats.total++;
			}
		});

		return stats;
	} catch {
		return {
			like: 0,
			love: 0,
			support: 0,
			insightful: 0,
			total: 0,
		};
	}
};

/**
 * Get user's reaction for a paper from backend or localStorage
 * @param paperId - The ID of the paper
 */
export const getUserReactionFromAPI = async (
	paperId: number
): Promise<ReactionData["type"] | null> => {
	try {
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");

		console.log(
			"🔍 Loading user reaction for paper",
			paperId,
			"- has token:",
			!!token
		);

		const response = await fetch(getApiUrl(`/reactions/user/${paperId}`), {
			headers: {
				...(token && { Authorization: `Bearer ${token}` }),
			},
		});

		console.log("📡 User reaction API response:", {
			status: response.status,
			ok: response.ok,
		});

		if (response.ok) {
			const result = await response.json();
			console.log("✅ Got user reaction from API:", result.reactionType);
			return result.reactionType;
		} else {
			console.warn("⚠️ API failed, falling back to localStorage");
			// Fallback to localStorage
			return getUserReactionType(paperId);
		}
	} catch (error) {
		console.warn(
			"❌ Failed to fetch user reaction from API, using localStorage:",
			error
		);
		return getUserReactionType(paperId);
	}
};

/**
 * Batch reaction operations
 */
export const getMultiplePaperReactions = (paperIds: number[]) => {
	return paperIds.reduce((acc, paperId) => {
		acc[paperId] = {
			count: getPaperReactionCount(paperId),
			hasReacted: hasUserReacted(paperId, "like"),
		};
		return acc;
	}, {} as Record<number, { count: number; hasReacted: boolean }>);
};
