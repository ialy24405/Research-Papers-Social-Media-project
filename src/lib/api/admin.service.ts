import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { User, Paper } from "../types";

export interface AdminUser extends User {
	// Additional admin-specific fields if needed
}

export interface AdminPaper extends Paper {
	approvedBy?: number;
	rejectionReason?: string;
}

export interface UpdatePaperStatusRequest {
	status: "approved" | "pending" | "rejected";
	reason?: string;
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
	async getPapers(status?: string, search?: string): Promise<AdminPaper[]> {
		const params: Record<string, string> = {};

		if (status && status !== "all") {
			params.status = status;
		}

		if (search && search.trim()) {
			params.search = search.trim();
		}

		return httpClient.get<AdminPaper[]>(
			API_ENDPOINTS.ADMIN.PAPERS,
			Object.keys(params).length > 0 ? params : undefined
		);
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

	/**
	 * Update paper status (admin only)
	 */
	async updatePaperStatus(
		paperId: number,
		data: UpdatePaperStatusRequest
	): Promise<{ message: string }> {
		return httpClient.put<{ message: string }>(
			API_ENDPOINTS.ADMIN.UPDATE_PAPER_STATUS(paperId.toString()),
			data
		);
	},
};
