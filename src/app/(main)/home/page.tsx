"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { File, ListFilter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";
import { usePapers } from "@/hooks/use-papers";
import { PaperCard } from "@/components/paper-card";
import { CategoryCard, CategoryCardSkeleton } from "@/components/category-card";

type SortOption = "recent" | "popular" | "trending";

export default function HomePage() {
	const { papers, isLoading: papersLoading } = usePapers();
	const { categories, isLoading: categoriesLoading } = useCategories();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<SortOption>("recent");

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const filteredAndSortedPapers = useMemo(() => {
		if (!papers || papers.length === 0) {
			return [];
		}

		let filtered = papers.filter((p) => p && p.status === "approved");

		// Apply search filter
		if (debouncedSearchQuery.trim()) {
			const query = debouncedSearchQuery.toLowerCase();
			filtered = filtered.filter(
				(paper) =>
					paper.title?.toLowerCase().includes(query) ||
					paper.name?.toLowerCase().includes(query) ||
					paper.authorName?.toLowerCase().includes(query) ||
					paper.description?.toLowerCase().includes(query) ||
					paper.categoryName?.toLowerCase().includes(query)
			);
		}

		// Apply sorting
		switch (sortBy) {
			case "recent":
				filtered.sort((a, b) => {
					const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
					const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
					return dateB - dateA;
				});
				break;
			case "popular":
				filtered.sort(
					(a, b) => (b.reactionCount || 0) - (a.reactionCount || 0)
				);
				break;
			case "trending":
				// Trending could be a combination of recent activity and popularity
				filtered.sort((a, b) => {
					const scoreA =
						(a.reactionCount || 0) + (a.commentCount || 0) + (a.saveCount || 0);
					const scoreB =
						(b.reactionCount || 0) + (b.commentCount || 0) + (b.saveCount || 0);
					return scoreB - scoreA;
				});
				break;
		}

		return filtered;
	}, [papers, debouncedSearchQuery, sortBy]);

	if (papersLoading || categoriesLoading) {
		return (
			<div className="grid flex-1 items-start gap-4 md:gap-8">
				<div className="space-y-4">
					<div className="flex items-center">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search papers by title, author, or keyword..."
								className="w-full rounded-lg bg-card pl-8 md:w-[300px] lg:w-[400px]"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								disabled
							/>
						</div>
						<div className="ml-auto flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="h-8 gap-1"
								disabled
							>
								<ListFilter className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
									Filter
								</span>
							</Button>
							<Button size="sm" className="h-8 gap-1" asChild>
								<Link href="/upload">
									<File className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
										Upload Paper
									</span>
								</Link>
							</Button>
						</div>
					</div>

					<section>
						<h2 className="text-2xl font-headline font-bold tracking-tight mb-4">
							Latest Updates
						</h2>
						<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<Card key={index} className="animate-pulse">
									<CardHeader>
										<div className="h-6 bg-gray-200 rounded mb-2">
											latestPapers.{index}.name
										</div>
										<div className="h-4 bg-gray-200 rounded"></div>
									</CardHeader>
									<CardContent>
										<div className="h-20 bg-gray-200 rounded"></div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-headline font-bold tracking-tight mb-6">
							Browse Categories
						</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, index) => (
								<CategoryCardSkeleton key={index} />
							))}
						</div>
					</section>
				</div>
			</div>
		);
	}

	return (
		<div className="grid flex-1 items-start gap-4 md:gap-8">
			<div className="space-y-4">
				<div className="flex items-center">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search papers by title, author, or keyword..."
							className="w-full rounded-lg bg-card pl-8 pr-8 md:w-[300px] lg:w-[400px]"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					<div className="ml-auto flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 gap-1">
									<ListFilter className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
										Sort by
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Sort by</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuCheckboxItem
									checked={sortBy === "recent"}
									onCheckedChange={() => setSortBy("recent")}
								>
									Most Recent
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={sortBy === "popular"}
									onCheckedChange={() => setSortBy("popular")}
								>
									Most Popular
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={sortBy === "trending"}
									onCheckedChange={() => setSortBy("trending")}
								>
									Trending
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button size="sm" className="h-8 gap-1" asChild>
							<Link href="/upload">
								<File className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
									Upload Paper
								</span>
							</Link>
						</Button>
					</div>
				</div>

				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-headline font-bold tracking-tight">
							{debouncedSearchQuery
								? `Search Results (${filteredAndSortedPapers.length})`
								: "Latest Updates"}
						</h2>
						{!debouncedSearchQuery && (
							<Button variant="outline" size="sm" asChild>
								<Link href="/papers">
									View All Papers
									<svg
										className="ml-1 w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</Link>
							</Button>
						)}
					</div>
					<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
						{filteredAndSortedPapers.length > 0 ? (
							filteredAndSortedPapers
								.slice(0, debouncedSearchQuery ? 12 : 3)
								.map((paper) => <PaperCard key={paper.id} paper={paper} />)
						) : (
							<div className="col-span-full text-center py-8">
								<p className="text-muted-foreground">
									{debouncedSearchQuery
										? "No papers found matching your search."
										: "No papers available."}
								</p>
							</div>
						)}
					</div>
				</section>

				{!debouncedSearchQuery && (
					<section>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-headline font-bold tracking-tight">
								Browse Categories
							</h2>
							<Button variant="outline" size="sm" asChild>
								<Link href="/categories">
									Browse All Categories
									<svg
										className="ml-1 w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</Link>
							</Button>
						</div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{categories.slice(0, 6).map((category) => (
								<CategoryCard key={category.id} category={category} />
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
