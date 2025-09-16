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

// Helper function to convert snake_case to camelCase for Paper objects
function transformPaper(paperData: any): Paper {
	return {
		...paperData,
		pdfUrl: paperData.pdf_url || paperData.pdfUrl,
		authorId: paperData.author_id || paperData.authorId,
		authorName: paperData.author_name || paperData.authorName,
		authorAvatar: paperData.author_avatar || paperData.authorAvatar,
		categoryId: paperData.category_id || paperData.categoryId,
		categoryName: paperData.category_name || paperData.categoryName,
		createdAt: paperData.created_at || paperData.createdAt,
		updatedAt: paperData.updated_at || paperData.updatedAt,
		reactionCount: parseInt(
			paperData.reaction_count || paperData.reactionCount || "0"
		),
		commentCount: parseInt(
			paperData.comment_count || paperData.commentCount || "0"
		),
		saveCount: parseInt(paperData.save_count || paperData.saveCount || "0"),
	};
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

		const response = await httpClient.get<any[]>(
			API_ENDPOINTS.PAPERS.LIST,
			queryParams
		);
		console.log("getPapers raw response:", response);

		// Transform snake_case to camelCase
		const transformedPapers = response.map(transformPaper);
		console.log("getPapers transformed:", transformedPapers);

		return transformedPapers;
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

		// For now, send as JSON since we're not handling actual file storage
		// In a real implementation, you'd upload the file to a storage service first
		const uploadData = {
			title: data.title,
			description: data.description,
			categoryId: data.categoryId,
			pdfUrl: data.pdfFile ? `temp-${Date.now()}-${data.pdfFile.name}` : null, // Placeholder URL
			aiSummary: null, // Optional field
		};

		console.log("Sending upload data:", uploadData);

		return httpClient.post<{ message: string; paperId: number }>(
			API_ENDPOINTS.PAPERS.UPLOAD,
			uploadData
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
	 * Save a paper
	 */
	async savePaper(id: string): Promise<{ message: string }> {
		return httpClient.post<{ message: string }>(API_ENDPOINTS.PAPERS.SAVE(id));
	},

	/**
	 * Unsave a paper
	 */
	async unsavePaper(id: string): Promise<{ message: string }> {
		return httpClient.delete<{ message: string }>(
			API_ENDPOINTS.PAPERS.SAVE(id)
		);
	},
};
