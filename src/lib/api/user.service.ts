import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { User, Paper } from "../types";

export interface UserPaper {
	id: number;
	name: string;
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
		return httpClient.get<Paper[]>(API_ENDPOINTS.USERS.SAVED_PAPERS);
	},
};
