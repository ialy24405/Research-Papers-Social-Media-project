import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { User, Paper } from "../types";

export interface AdminUser extends User {
	// Additional admin-specific fields if needed
}

export interface AdminPaper extends Paper {
	// Additional admin-specific fields if needed
}

export const adminService = {
	/**
	 * Get all users (admin only)
	 */
	async getUsers(): Promise<AdminUser[]> {
		return httpClient.get<AdminUser[]>(API_ENDPOINTS.ADMIN.USERS);
	},

	/**
	 * Get all papers for moderation (admin only)
	 */
	async getPapers(): Promise<AdminPaper[]> {
		return httpClient.get<AdminPaper[]>(API_ENDPOINTS.ADMIN.PAPERS);
	},

	/**
	 * Update user role (admin only)
	 */
	async updateUserRole(
		userId: string,
		role: "user" | "admin"
	): Promise<{ message: string }> {
		return httpClient.patch<{ message: string }>(
			API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(userId),
			{ role }
		);
	},

	/**
	 * Moderate paper (approve/reject) (admin only)
	 */
	async moderatePaper(
		paperId: string,
		action: "approve" | "reject",
		reason?: string
	): Promise<{ message: string }> {
		return httpClient.patch<{ message: string }>(
			API_ENDPOINTS.ADMIN.MODERATE_PAPER(paperId),
			{ action, reason }
		);
	},
};
