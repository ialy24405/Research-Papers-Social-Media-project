"use client";

import { useState, useEffect } from "react";

export interface AdminCategory {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	imageHint?: string;
}

export interface CategoryCreateData {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	imageHint?: string;
}

export interface CategoryUpdateData {
	name?: string;
	description?: string;
	imageUrl?: string;
	imageHint?: string;
}

export const useAdminCategories = () => {
	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("auth_token") || localStorage.getItem("token");
	};

	const fetchCategories = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch categories");
			}

			const categoriesData = await response.json();
			console.log("Fetched categories:", categoriesData);
			setCategories(categoriesData);
			return { success: true };
		} catch (error: any) {
			console.error("Fetch categories error:", error);
			setError(error.message);
			return { success: false, error: error.message };
		} finally {
			setIsLoading(false);
		}
	};

	const createCategory = async (categoryData: CategoryCreateData) => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/categories`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(categoryData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create category");
			}

			// Refresh categories list after successful creation
			await fetchCategories();
			return { success: true };
		} catch (error: any) {
			console.error("Create category error:", error);
			return { success: false, error: error.message };
		}
	};

	const updateCategory = async (
		categoryId: string,
		updates: CategoryUpdateData
	) => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${categoryId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updates),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update category");
			}

			// Refresh categories list after successful update
			await fetchCategories();
			return { success: true };
		} catch (error: any) {
			console.error("Update category error:", error);
			return { success: false, error: error.message };
		}
	};

	const deleteCategory = async (categoryId: string) => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/${categoryId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete category");
			}

			// Refresh categories list after successful deletion
			await fetchCategories();
			return { success: true };
		} catch (error: any) {
			console.error("Delete category error:", error);
			return { success: false, error: error.message };
		}
	};

	return {
		categories,
		isLoading,
		error,
		fetchCategories,
		createCategory,
		updateCategory,
		deleteCategory,
	};
};
