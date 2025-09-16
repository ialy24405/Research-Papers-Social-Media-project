"use client";

import { useState, useEffect } from "react";

export interface AdminUser {
	id: number;
	full_name: string;
	email: string;
	birth_date: string;
	college_name: string;
	country: string;
	avatar_url?: string;
	role: "user" | "admin" | "owner";
	created_at: string;
}

export interface UserFilters {
	role?: string;
	search?: string;
}

export interface UserUpdateData {
	full_name?: string;
	email?: string;
	birth_date?: string;
	college_name?: string;
	country?: string;
}

export const useAdminUsers = () => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("auth_token") || localStorage.getItem("token");
	};

	const fetchUsers = async (filters: UserFilters = {}) => {
		setIsLoading(true);
		setError(null);

		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const params = new URLSearchParams();
			if (filters.role && filters.role !== "all") {
				params.append("role", filters.role);
			}
			if (filters.search && filters.search.trim()) {
				params.append("search", filters.search.trim());
			}

			const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/users${
				params.toString() ? `?${params.toString()}` : ""
			}`;

			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch users");
			}

			const userData = await response.json();
			// console.log("Fetched users:", userData);
			// set users manually to verify field names
			const formattedUsers = userData.map((user: any) => ({
				id: user.id,
				full_name: user.full_name,
				email: user.email,
				birth_date: user.birth_date,
				college_name: user.college_name,
				country: user.country,
				avatar_url: user.avatar_url,
				role: user.role,
				created_at: user.created_at,
			}));
			setUsers(formattedUsers);
			return { success: true };
		} catch (error: any) {
			console.error("Fetch users error:", error);
			setError(error.message);
			return { success: false, error: error.message };
		} finally {
			setIsLoading(false);
		}
	};

	const updateUserRole = async (userId: number, role: string) => {
		try {
			console.log("Updating user role:", { userId, role });
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`;
			console.log("API URL:", apiUrl);

			const response = await fetch(apiUrl, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ role }),
			});

			console.log("Response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update user role");
			}

			// Refresh users list after successful update
			await fetchUsers();
			return { success: true };
		} catch (error: any) {
			console.error("Update user role error:", error);
			return { success: false, error: error.message };
		}
	};

	const updateUser = async (userId: number, updates: UserUpdateData) => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
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
				throw new Error(errorData.error || "Failed to update user");
			}

			// Refresh users list after successful update
			await fetchUsers();
			return { success: true };
		} catch (error: any) {
			console.error("Update user error:", error);
			return { success: false, error: error.message };
		}
	};

	const deleteUser = async (userId: number) => {
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
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
				throw new Error(errorData.error || "Failed to delete user");
			}

			// Refresh users list after successful deletion
			await fetchUsers();
			return { success: true };
		} catch (error: any) {
			console.error("Delete user error:", error);
			return { success: false, error: error.message };
		}
	};

	return {
		users,
		isLoading,
		error,
		fetchUsers,
		updateUserRole,
		updateUser,
		deleteUser,
	};
};
