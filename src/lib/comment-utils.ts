/**
 * Comment utilities for papers
 */

import { getApiUrl } from "./config";

export interface Comment {
	id: number;
	user: {
		id: number;
		name: string;
		avatarUrl: string | null;
	};
	text: string;
	createdAt: string;
	parent_comment_id?: number;
	replies?: Comment[];
}

/**
 * Add a comment to a paper
 * @param paperId - The ID of the paper
 * @param commentText - The comment text
 * @param parentCommentId - Optional parent comment ID for replies
 */
export const addComment = async (
	paperId: number,
	commentText: string,
	parentCommentId?: number
): Promise<{ success: boolean; error?: string }> => {
	try {
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");

		if (!token) {
			return { success: false, error: "Authentication required" };
		}

		if (!commentText.trim()) {
			return { success: false, error: "Comment text is required" };
		}

		if (commentText.trim().length > 1000) {
			return {
				success: false,
				error: "Comment too long (max 1000 characters)",
			};
		}

		console.log("🔄 Adding comment:", {
			paperId,
			commentLength: commentText.length,
			parentCommentId,
		});

		const requestBody: { comment_text: string; parentCommentId?: number } = {
			comment_text: commentText.trim(),
		};

		if (parentCommentId) {
			requestBody.parentCommentId = parentCommentId;
		}

		console.log("📤 Request body:", requestBody);
		console.log("🔑 Auth token:", token ? "Present" : "Missing");

		const response = await fetch(getApiUrl(`/papers/${paperId}/comment`), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(requestBody),
		});

		console.log("📡 Comment API response:", {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
		});

		if (response.ok) {
			const result = await response.json();
			console.log("✅ Comment added successfully:", result);

			// Dispatch custom event to update UI
			window.dispatchEvent(
				new CustomEvent("commentAdded", {
					detail: {
						paperId,
						commentText: commentText.trim(),
						parentCommentId,
					},
				})
			);

			return { success: true };
		} else {
			let errorData: any = {};
			let rawResponseText = "";
			try {
				rawResponseText = await response.text();
				console.log("📥 Raw response text:", rawResponseText);
				if (rawResponseText) {
					errorData = JSON.parse(rawResponseText);
				}
			} catch (jsonError) {
				console.warn("Failed to parse error response as JSON:", jsonError);
				errorData = {
					error: `HTTP ${response.status}: ${response.statusText}`,
					rawResponse: rawResponseText,
				};
			}

			console.error("❌ Comment API error:", errorData);
			console.error("❌ Response details:", {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
			});

			// Handle known errors
			if (response.status === 401) {
				return { success: false, error: "Please log in to comment" };
			}

			if (response.status === 400) {
				const message = errorData.error || "Invalid comment";
				return { success: false, error: message };
			}

			return {
				success: false,
				error:
					errorData.error || `Failed to add comment (HTTP ${response.status})`,
			};
		}
	} catch (error) {
		console.error("❌ Failed to add comment:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error occurred",
		};
	}
};

/**
 * Get comments for a paper
 * @param paperId - The ID of the paper
 */
export const getComments = async (
	paperId: number
): Promise<{ success: boolean; comments?: Comment[]; error?: string }> => {
	try {
		console.log("🔄 Fetching comments for paper:", paperId);

		const response = await fetch(getApiUrl(`/papers/${paperId}/comments`));

		console.log("📡 Comments API response:", {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
		});

		if (response.ok) {
			const result = await response.json();
			console.log("✅ Comments fetched successfully:", result);

			// Normalize different possible response shapes:
			// - An array of comments
			// - An object with `comments` property
			// - An object with `data` property (common REST wrapper)
			let rawComments: any[] = [];
			if (Array.isArray(result)) {
				rawComments = result;
			} else if (Array.isArray(result.comments)) {
				rawComments = result.comments;
			} else if (Array.isArray(result.data)) {
				rawComments = result.data;
			} else {
				// fallback: try to find any array-valued prop
				for (const key of Object.keys(result || {})) {
					if (Array.isArray((result as any)[key])) {
						rawComments = (result as any)[key];
						break;
					}
				}
			}

			// Transform the raw comments to match our Comment interface
			const comments: Comment[] = rawComments.map((rawComment: any) => {
				// Handle both 'author' and 'user' properties from API
				const userInfo = rawComment.author || rawComment.user || {};

				return {
					id: rawComment.id,
					text: rawComment.text || rawComment.comment_text,
					createdAt: rawComment.createdAt || rawComment.created_at,
					parent_comment_id:
						rawComment.parent_comment_id || rawComment.parentCommentId,
					user: {
						id: userInfo.id || userInfo.user_id,
						name:
							userInfo.name ||
							userInfo.user_name ||
							userInfo.full_name ||
							"Unknown User",
						avatarUrl: userInfo.avatarUrl || userInfo.avatar_url || null,
					},
					replies: rawComment.replies
						? rawComment.replies.map((reply: any) => ({
								id: reply.id,
								text: reply.text || reply.comment_text,
								createdAt: reply.createdAt || reply.created_at,
								parent_comment_id:
									reply.parent_comment_id || reply.parentCommentId,
								user: {
									id:
										(reply.author || reply.user || {}).id ||
										(reply.author || reply.user || {}).user_id,
									name:
										(reply.author || reply.user || {}).name ||
										(reply.author || reply.user || {}).user_name ||
										(reply.author || reply.user || {}).full_name ||
										"Unknown User",
									avatarUrl:
										(reply.author || reply.user || {}).avatarUrl ||
										(reply.author || reply.user || {}).avatar_url ||
										null,
								},
						  }))
						: [],
				};
			});

			return { success: true, comments };
		} else {
			let errorData: any = {};
			try {
				errorData = await response.json();
			} catch (jsonError) {
				console.warn("Failed to parse error response as JSON:", jsonError);
				errorData = {
					error: `HTTP ${response.status}: ${response.statusText}`,
				};
			}

			console.error("❌ Comments API error:", errorData);

			return {
				success: false,
				error:
					errorData.error ||
					`Failed to fetch comments (HTTP ${response.status})`,
			};
		}
	} catch (error) {
		console.error("❌ Failed to fetch comments:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error occurred",
		};
	}
};

/**
 * Subscribe to comment changes for a specific paper
 * @param paperId - The paper ID to watch
 * @param callback - Function to call when comments change
 * @returns Cleanup function
 */
export const subscribeToCommentChanges = (
	paperId: number,
	callback: (data: {
		paperId: number;
		commentText: string;
		parentCommentId?: number;
	}) => void
) => {
	const handleCommentChange = (event: CustomEvent) => {
		if (event.detail.paperId === paperId) {
			callback({
				paperId: event.detail.paperId,
				commentText: event.detail.commentText,
				parentCommentId: event.detail.parentCommentId,
			});
		}
	};

	window.addEventListener("commentAdded", handleCommentChange as EventListener);

	return () => {
		window.removeEventListener(
			"commentAdded",
			handleCommentChange as EventListener
		);
	};
};
