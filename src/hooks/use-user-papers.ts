"use client";

import { useState, useEffect } from "react";
import { userService, type UserPaper } from "../lib/api/user.service";

export function useUserPapers() {
	const [papers, setPapers] = useState<UserPaper[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserPapers = async () => {
			try {
				setIsLoading(true);
				setError(null);
				console.log("Fetching user papers...");
				const userPapers = await userService.getMyPapers();
				console.log("User papers fetched:", userPapers);
				setPapers(userPapers);
			} catch (err: any) {
				console.error("Failed to fetch user papers:", err);
				setError(err.message || "Failed to fetch papers");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserPapers();
	}, []);

	return {
		papers,
		isLoading,
		error,
		refetch: () => {
			const fetchUserPapers = async () => {
				try {
					setIsLoading(true);
					setError(null);
					const userPapers = await userService.getMyPapers();
					setPapers(userPapers);
				} catch (err: any) {
					console.error("Failed to fetch user papers:", err);
					setError(err.message || "Failed to fetch papers");
				} finally {
					setIsLoading(false);
				}
			};
			fetchUserPapers();
		},
	};
}
