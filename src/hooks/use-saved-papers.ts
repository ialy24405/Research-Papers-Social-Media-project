"use client";

import { useState, useEffect } from "react";
import { userService } from "../lib/api/user.service";
import type { Paper } from "../lib/types";

export function useSavedPapers() {
	const [papers, setPapers] = useState<Paper[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const normalize = (maybe: any): Paper[] => {
			if (Array.isArray(maybe)) return maybe;
			if (maybe && typeof maybe === "object" && Array.isArray(maybe.papers))
				return maybe.papers;
			return [];
		};

		const fetchSavedPapers = async () => {
			try {
				setIsLoading(true);
				setError(null);
				console.log("Fetching saved papers...");
				const savedPapers = await userService.getSavedPapers();
				console.log("Saved papers fetched:", savedPapers);
				setPapers(normalize(savedPapers));
			} catch (err: any) {
				console.error("Failed to fetch saved papers:", err);
				setError(err.message || "Failed to fetch saved papers");
			} finally {
				setIsLoading(false);
			}
		};

		fetchSavedPapers();
	}, []);

	// Listen for save changes to update the list
	useEffect(() => {
		const handleSaveChange = (event: CustomEvent) => {
			console.log("Save change detected:", event.detail);
			// Refetch saved papers when save status changes
			const fetchSavedPapers = async () => {
				try {
					const savedPapers = await userService.getSavedPapers();
					// normalize before setting
					if (Array.isArray(savedPapers)) setPapers(savedPapers);
					else if (
						savedPapers &&
						typeof savedPapers === "object" &&
						Array.isArray((savedPapers as any).papers)
					)
						setPapers((savedPapers as any).papers);
					else setPapers([]);
				} catch (err: any) {
					console.error("Failed to refetch saved papers:", err);
				}
			};
			fetchSavedPapers();
		};

		window.addEventListener(
			"paperSaveChanged",
			handleSaveChange as EventListener
		);

		return () => {
			window.removeEventListener(
				"paperSaveChanged",
				handleSaveChange as EventListener
			);
		};
	}, []);

	return {
		papers,
		isLoading,
		error,
		refetch: () => {
			const fetchSavedPapers = async () => {
				try {
					setIsLoading(true);
					setError(null);
					const savedPapers = await userService.getSavedPapers();
					if (Array.isArray(savedPapers)) setPapers(savedPapers);
					else if (
						savedPapers &&
						typeof savedPapers === "object" &&
						Array.isArray((savedPapers as any).papers)
					)
						setPapers((savedPapers as any).papers);
					else setPapers([]);
				} catch (err: any) {
					console.error("Failed to fetch saved papers:", err);
					setError(err.message || "Failed to fetch saved papers");
				} finally {
					setIsLoading(false);
				}
			};
			fetchSavedPapers();
		},
	};
}
