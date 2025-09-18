import { useState, useEffect, useCallback } from "react";
import {
	togglePaperReaction,
	getPaperReactionCount,
	getUserReactionType,
	getUserReactionFromAPI,
	getReactionStats,
	ReactionData,
} from "@/lib/reaction-utils";

/**
 * React hook for comprehensive paper reaction functionality
 * @param paperId - The ID of the paper
 * @param initialCount - Initial reaction count (optional)
 */
export const usePaperReaction = (paperId: number, initialCount: number = 0) => {
	const [stats, setStats] = useState({
		like: 0,
		love: 0,
		support: 0,
		insightful: 0,
		total: initialCount,
	});
	const [currentReaction, setCurrentReaction] = useState<
		ReactionData["type"] | null
	>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Load initial stats and user reaction
	useEffect(() => {
		// Don't make API calls for invalid paper IDs
		if (typeof window !== "undefined" && paperId && paperId > 0) {
			// Load stats (try API first, then localStorage)
			getReactionStats(paperId)
				.then(setStats)
				.catch(() => {
					// Fallback to initial count
					setStats((prev) => ({ ...prev, total: initialCount }));
				});

			// Load current user reaction from API (with localStorage fallback)
			getUserReactionFromAPI(paperId)
				.then(setCurrentReaction)
				.catch(() => {
					// Fallback to localStorage only
					setCurrentReaction(getUserReactionType(paperId));
				});
		} else if (paperId <= 0) {
			// Reset state for invalid paper IDs
			setStats({
				like: 0,
				love: 0,
				support: 0,
				insightful: 0,
				total: initialCount,
			});
			setCurrentReaction(null);
		}
	}, [paperId, initialCount]);

	// Listen for reaction changes from other components
	useEffect(() => {
		const handleReactionChange = (event: CustomEvent) => {
			const {
				paperId: eventPaperId,
				stats: newStats,
				reactionType,
			} = event.detail;
			if (eventPaperId === paperId) {
				if (newStats) {
					setStats(newStats);
				}
				setCurrentReaction(reactionType);
			}
		};

		window.addEventListener(
			"paperReactionChanged",
			handleReactionChange as EventListener
		);
		return () => {
			window.removeEventListener(
				"paperReactionChanged",
				handleReactionChange as EventListener
			);
		};
	}, [paperId]);

	const toggleReaction = useCallback(
		async (reactionType: ReactionData["type"]) => {
			// Don't allow actions on invalid paper IDs
			if (!paperId || paperId <= 0) {
				return {
					success: false,
					action: "added" as const,
					userReaction: currentReaction,
					stats,
				};
			}

			setIsLoading(true);

			try {
				const result = await togglePaperReaction(paperId, reactionType, {
					optimistic: true,
					showAlert: false,
				});

				if (result.success) {
					// Update local state
					if (result.stats) {
						setStats(result.stats);
					}
					setCurrentReaction(result.userReaction);
					return result;
				}
			} catch (error) {
				console.error("Failed to toggle reaction:", error);
			} finally {
				setIsLoading(false);
			}

			return {
				success: false,
				action: "added" as const,
				userReaction: currentReaction,
				stats,
			};
		},
		[paperId, currentReaction, stats]
	);

	return {
		stats,
		currentReaction,
		isLoading,
		toggleReaction,
		// Backward compatibility
		count: stats.total,
		isReacted: currentReaction !== null,
	};
};
