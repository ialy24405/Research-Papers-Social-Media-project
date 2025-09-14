"use client";

import { useState, useEffect, useCallback } from "react";
import {
	paperService,
	type PapersListParams,
	type PaperDetails,
} from "../lib/api";
import type { Paper } from "../lib/types";

export function usePapers(params?: PapersListParams) {
	const [papers, setPapers] = useState<Paper[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPapers = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await paperService.getPapers(params);
			setPapers(data);
		} catch (err: any) {
			setError(err.error || "Failed to fetch papers");
		} finally {
			setIsLoading(false);
		}
	}, [params]);

	useEffect(() => {
		fetchPapers();
	}, [fetchPapers]);

	const uploadPaper = async (data: any) => {
		try {
			const result = await paperService.uploadPaper(data);
			await fetchPapers(); // Refresh the papers list
			return result;
		} catch (err: any) {
			throw err;
		}
	};

	return {
		papers,
		isLoading,
		error,
		refetch: fetchPapers,
		uploadPaper,
	};
}

export function usePaper(id: string) {
	const [paper, setPaper] = useState<PaperDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPaper = async () => {
			if (!id) return;

			try {
				setIsLoading(true);
				setError(null);
				const data = await paperService.getPaper(id);
				setPaper(data);
			} catch (err: any) {
				setError(err.error || "Failed to fetch paper");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPaper();
	}, [id]);

	return {
		paper,
		isLoading,
		error,
	};
}
