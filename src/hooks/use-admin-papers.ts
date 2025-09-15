"use client";

import { useState, useEffect, useCallback } from "react";
import {
	adminService,
	type AdminPaper,
	type UpdatePaperStatusRequest,
} from "../lib/api/admin.service";

export function useAdminPapers() {
	const [papers, setPapers] = useState<AdminPaper[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string>("all");

	const fetchPapers = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			console.log("Fetching admin papers with status:", status);
			const data = await adminService.getPapers(status);
			setPapers(data);
			console.log("Admin papers fetched:", data.length);
		} catch (err: any) {
			console.error("Failed to fetch admin papers:", err);
			setError(err.message || "Failed to fetch papers");
		} finally {
			setIsLoading(false);
		}
	}, [status]);

	// Fetch papers on mount and when status changes
	useEffect(() => {
		fetchPapers();
	}, [fetchPapers]);

	const updatePaperStatus = async (
		paperId: number,
		statusData: UpdatePaperStatusRequest
	) => {
		try {
			console.log("Updating paper status:", paperId, statusData);
			await adminService.updatePaperStatus(paperId, statusData);

			// Update the local state
			setPapers((prevPapers) =>
				prevPapers.map((paper) =>
					paper.id === paperId
						? {
								...paper,
								status: statusData.status,
								rejectionReason: statusData.reason,
						  }
						: paper
				)
			);

			console.log("Paper status updated successfully");
			return { success: true };
		} catch (err: any) {
			console.error("Failed to update paper status:", err);
			return {
				success: false,
				error: err.message || "Failed to update paper status",
			};
		}
	};

	const filterByStatus = useCallback((newStatus: string) => {
		setStatus(newStatus);
		// Refetch papers with new status filter
	}, []);

	const refetch = useCallback(() => {
		fetchPapers();
	}, [fetchPapers]);

	return {
		papers,
		isLoading,
		error,
		status,
		updatePaperStatus,
		filterByStatus,
		refetch,
	};
}
