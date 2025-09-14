import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { Category } from "../types";

export const categoryService = {
	/**
	 * Get all categories
	 */
	async getCategories(): Promise<Category[]> {
		return httpClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);
	},

	/**
	 * Get category by ID
	 */
	async getCategory(id: string): Promise<Category> {
		return httpClient.get<Category>(API_ENDPOINTS.CATEGORIES.GET(id));
	},
};
