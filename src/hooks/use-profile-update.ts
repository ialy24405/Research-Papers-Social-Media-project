"use client";

import { useState } from "react";

export interface ProfileUpdateData {
	fullName: string;
	collegeName: string;
	country: string;
	avatarUrl?: string;
}

export const useProfileUpdate = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window !== "undefined") {
			return (
				localStorage.getItem("auth_token") || localStorage.getItem("token")
			);
		}
		return null;
	};

	const updateProfile = async (profileData: ProfileUpdateData) => {
		try {
			setIsUpdating(true);
			setError(null);

			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/users/me`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(profileData),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			return { success: true };
		} catch (error: any) {
			console.error("Update profile error:", error);
			setError(error.message);
			return { success: false, error: error.message };
		} finally {
			setIsUpdating(false);
		}
	};

	return {
		updateProfile,
		isUpdating,
		error,
		clearError: () => setError(null),
	};
};
