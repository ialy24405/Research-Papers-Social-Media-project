import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api/client";

interface OverviewStats {
	totalPapers: number;
	approvedPapers: number;
	pendingPapers: number;
	rejectedPapers: number;
	totalUsers: number;
	adminUsers: number;
	ownerUsers: number;
	regularUsers: number;
	totalCategories: number;
	totalComments: number;
	totalSaves: number;
}

interface PaperOverTime {
	date: string;
	count: number;
	status: string;
}

interface TopCategory {
	id: string;
	name: string;
	paper_count: number;
}

interface ReactionDistribution {
	reaction_type: string;
	count: number;
}

interface ActiveUser {
	id: string;
	full_name: string;
	email: string;
	paper_count: number;
}

interface RecentActivity {
	activity_type: string;
	description: string;
	timestamp: string;
	user_name: string;
}

interface InsightsData {
	overview: OverviewStats;
	charts: {
		papersOverTime: PaperOverTime[];
		topCategories: TopCategory[];
		reactionDistribution: ReactionDistribution[];
	};
	lists: {
		mostActiveUsers: ActiveUser[];
		recentActivity: RecentActivity[];
	};
}

export function useAdminInsights() {
	const [data, setData] = useState<InsightsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchInsights = async () => {
		try {
			setLoading(true);
			setError(null);

			const result = await httpClient.get<InsightsData>("/admin/insights");
			setData(result);
		} catch (err: any) {
			console.error("Failed to fetch admin insights:", err);
			setError(err.error || err.message || "Failed to fetch insights");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInsights();
	}, []);

	return {
		data,
		loading,
		error,
		refetch: fetchInsights,
	};
}
