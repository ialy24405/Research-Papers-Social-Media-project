import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { Paper, PaperComment, PaperUploadData } from "../types";

export interface PapersListParams {
	category?: string;
	status?: "approved" | "pending" | "rejected";
	limit?: number;
	offset?: number;
}

export interface PaperDetails extends Paper {
	comments: PaperComment[];
}

export const paperService = {
	/**
	 * Get papers list with optional filters
	 */
	async getPapers(params?: PapersListParams): Promise<Paper[]> {
		const queryParams: Record<string, string> = {};

		if (params?.category) queryParams.category = params.category;
		if (params?.status) queryParams.status = params.status;
		if (params?.limit) queryParams.limit = params.limit.toString();
		if (params?.offset) queryParams.offset = params.offset.toString();
        const response = await httpClient.get<Paper[]>(API_ENDPOINTS.PAPERS.LIST, queryParams);
        console.log("getPapers response:", response);
		return response;
	},

	/**
	 * Get paper details by ID
	 */
	async getPaper(id: string): Promise<PaperDetails> {
		return httpClient.get<PaperDetails>(API_ENDPOINTS.PAPERS.GET(id));
	},

	/**
	 * Upload a new paper
	 */
	async uploadPaper(
		data: PaperUploadData
	): Promise<{ message: string; paperId: number }> {
		console.log("uploadPaper called with data:", data);
		console.log("API endpoint:", API_ENDPOINTS.PAPERS.UPLOAD);

		const formData = new FormData();
		formData.append("title", data.title);
		formData.append("description", data.description);
		formData.append("categoryId", data.categoryId);
		formData.append("pdfFile", data.pdfFile);

		console.log("FormData entries:");
		for (const [key, value] of formData.entries()) {
			console.log(`${key}:`, value);
		}

		return httpClient.upload<{ message: string; paperId: number }>(
			API_ENDPOINTS.PAPERS.UPLOAD,
			formData
		);
	},

	/**
	 * React to a paper (like/unlike)
	 */
	async reactToPaper(id: string): Promise<{ message: string }> {
		return httpClient.post<{ message: string }>(API_ENDPOINTS.PAPERS.REACT(id));
	},

	/**
	 * Add comment to a paper
	 */
	async commentOnPaper(
		id: string,
		comment: string
	): Promise<{ message: string }> {
		return httpClient.post<{ message: string }>(
			API_ENDPOINTS.PAPERS.COMMENT(id),
			{ comment }
		);
	},

	/**
	 * Save/unsave a paper
	 */
	async savePaper(id: string): Promise<{ message: string }> {
		return httpClient.post<{ message: string }>(API_ENDPOINTS.PAPERS.SAVE(id));
	},
};
