"use client";

import { useState, useEffect } from "react";

export interface UserInteraction {
	id: string;
	type: string;
	action: string;
	createdAt: string;
	paper: {
		id: number;
		title: string;
		author: {
			id: number;
			name: string;
		};
		category: string;
	};
}

export const useUserInteractions = () => {
	const [interactions, setInteractions] = useState<UserInteraction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window !== "undefined") {
			return (
				localStorage.getItem("auth_token") || localStorage.getItem("token")
			);
		}
		return null;
	};

	const fetchInteractions = async (limit: number = 20) => {
		try {
			setIsLoading(true);
			setError(null);

			const token = getAuthToken();
			if (!token) {
				throw new Error("Authentication required");
			}

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/users/me/interactions?limit=${limit}`,
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
				throw new Error(errorData.error || "Failed to fetch interactions");
			}

			const data = await response.json();
			setInteractions(data);
		} catch (error: any) {
			console.error("Fetch interactions error:", error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchInteractions();
	}, []);

	const refresh = () => fetchInteractions();

	return {
		interactions,
		isLoading,
		error,
		refresh,
		fetchMore: (limit: number) => fetchInteractions(limit),
	};
};
