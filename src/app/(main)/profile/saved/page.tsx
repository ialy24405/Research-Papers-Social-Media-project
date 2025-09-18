"use client";

import { PaperCard } from "@/components/paper-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSavedPapers } from "@/hooks/use-saved-papers";
import { ListFilter, Search } from "lucide-react";
import Link from "next/link";

export default function SavedPostsPage() {
	const { papers: papers, isLoading, error } = useSavedPapers();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading saved papers...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center text-red-600">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold font-headline">Saved Papers</h1>
					<p className="text-muted-foreground">
						Papers you have bookmarked for later reading.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search saved papers..." className="pl-8" />
					</div>
					<Button variant="outline" className="gap-1.5">
						<ListFilter className="h-4 w-4" />
						Filter
					</Button>
				</div>
			</div>

			{papers.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
					{papers.map((paper) => (
						<PaperCard key={paper.id} paper={paper} />
					))}
				</div>
			) : (
				<div className="text-center py-20 border-2 border-dashed rounded-lg">
					<h2 className="text-xl font-semibold">No Saved Papers Yet</h2>
					<p className="mt-2 text-muted-foreground">
						Start exploring and save papers to find them here later.
					</p>
					<Button asChild className="mt-4">
						<Link href="/home">Explore Papers</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
