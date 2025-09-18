import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { User, Paper } from "../types";

export interface UserPaper {
	id: number;
	name: string;
	title: string;
	status: "approved" | "pending" | "rejected";
	rejectionReason?: string;
	createdAt: string;
	interactions: {
		reactions: number;
		comments: number;
		saves: number;
	};
}

export const userService = {
	/**
	 * Get current user profile
	 */
	async getProfile(): Promise<User> {
		const res = await httpClient.get<User>(API_ENDPOINTS.USERS.PROFILE);
		console.log("User profile response:", res);
		console.log(res);
		return res;
	},

	/**
	 * Update user profile
	 */
	async updateProfile(
		data: Partial<User>
	): Promise<{ message: string; user: User }> {
		return httpClient.put<{ message: string; user: User }>(
			API_ENDPOINTS.USERS.UPDATE_PROFILE,
			data
		);
	},

	/**
	 * Get current user's papers
	 */
	async getMyPapers(): Promise<UserPaper[]> {
		return httpClient.get<UserPaper[]>(API_ENDPOINTS.USERS.MY_PAPERS);
	},

	/**
	 * Get current user's saved papers
	 */
	async getSavedPapers(): Promise<Paper[]> {
		const res: any = await httpClient.get(API_ENDPOINTS.USERS.SAVED_PAPERS);

		// API may return either an array or an object { papers: [], pagination: {} }
		let papers: any[] = [];
		if (Array.isArray(res)) {
			papers = res;
		} else if (res && typeof res === "object" && Array.isArray(res.papers)) {
			papers = res.papers;
		} else {
			return [];
		}

		// Transform the data to match the Paper interface expected by PaperCard
		return papers.map((paper: any) => ({
			id: paper.id,
			title: paper.title,
			name: paper.title, // PaperCard expects 'name' property
			description: paper.description,
			pdfUrl: paper.pdfUrl,
			status: paper.status,
			createdAt: paper.createdAt,
			updatedAt: paper.updatedAt,
			// Handle author data - API returns author.name, PaperCard expects authorName
			author: {
				id: paper.author?.id || 0,
				fullName: paper.author?.name || "Unknown Author",
				email: "",
				collegeName: "",
				country: "",
				birthDate: "",
				role: "user" as const,
				avatarUrl: paper.author?.avatarUrl || null,
				ssn: "",
				createdAt: "",
			},
			authorId: paper.author?.id || 0,
			authorName: paper.author?.name || "Unknown Author",
			authorAvatar: paper.author?.avatarUrl || null,
			// Handle category data
			category: {
				id: paper.category?.id || "",
				name: paper.category?.name || "Unknown Category",
				description: "",
				imageUrl: "",
				imageHint: "",
			},
			categoryId: paper.category?.id || "",
			categoryName: paper.category?.name || "Unknown Category",
			categoryDescription: "",
			// Default interaction counts
			reactionCount: 0,
			commentCount: 0,
			saveCount: 0,
			interactions: {
				reactions: 0,
				comments: 0,
				saves: 0,
			},
		}));
	},
};
