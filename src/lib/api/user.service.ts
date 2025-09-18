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
		if (Array.isArray(res)) return res as Paper[];
		if (res && typeof res === "object" && Array.isArray(res.papers))
			return res.papers as Paper[];
		return [];
	},
};
