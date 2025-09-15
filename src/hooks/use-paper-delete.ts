"use client";

import { useState } from "react";

export const usePaperDelete = () => {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window !== "undefined") {
			return (
				localStorage.getItem("auth_token") || localStorage.getItem("token")
			);
		}
		return null;
	};

	const deletePaper = async (paperId: number) => {
		try {
			setIsDeleting(true);
			setError(null);

			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/papers/${paperId}`,
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
				throw new Error(errorData.error || "Failed to delete paper");
			}

			return { success: true };
		} catch (error: any) {
			console.error("Delete paper error:", error);
			setError(error.message);
			return { success: false, error: error.message };
		} finally {
			setIsDeleting(false);
		}
	};

	return {
		deletePaper,
		isDeleting,
		error,
		clearError: () => setError(null),
	};
};
