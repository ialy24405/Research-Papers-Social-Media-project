"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, ListFilter, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePapers } from "@/hooks/use-papers";
import { useCategories } from "@/hooks/use-categories";
import { PaperCard } from "@/components/paper-card";

type SortOption = "recent" | "popular" | "trending" | "alphabetical";

export default function PapersPage() {
	const { papers, isLoading: papersLoading } = usePapers();
	const { categories, isLoading: categoriesLoading } = useCategories();

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
	const [sortBy, setSortBy] = useState<SortOption>("recent");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

		// Only show approved papers
		let filtered = papers.filter((p) => p && p.status === "approved");

		// Apply category filter
		if (selectedCategory !== "all") {
			filtered = filtered.filter(
				(paper) => paper.categoryId === selectedCategory
			);
		}

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
				filtered.sort((a, b) => {
					const scoreA =
						(a.reactionCount || 0) + (a.commentCount || 0) + (a.saveCount || 0);
					const scoreB =
						(b.reactionCount || 0) + (b.commentCount || 0) + (b.saveCount || 0);
					return scoreB - scoreA;
				});
				break;
			case "alphabetical":
				filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
				break;
		}

		return filtered;
	}, [papers, debouncedSearchQuery, sortBy, selectedCategory]);

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedCategory("all");
		setSortBy("recent");
	};

	const hasActiveFilters =
		searchQuery || selectedCategory !== "all" || sortBy !== "recent";

	if (papersLoading || categoriesLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<BookOpen className="h-8 w-8 text-primary" />
						<h1 className="text-3xl font-bold font-headline">All Papers</h1>
					</div>
					<p className="text-muted-foreground">
						Discover and explore research papers from various academic
						disciplines.
					</p>
				</div>

				{/* Loading skeleton for filters */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
					<div className="flex flex-1 gap-4">
						<div className="relative flex-1 max-w-md">
							<div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
						</div>
						<div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
					</div>
					<div className="flex gap-2">
						<div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse" />
					</div>
				</div>

				{/* Loading skeleton for papers */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className="bg-gray-200 rounded-lg h-96 animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<BookOpen className="h-8 w-8 text-primary" />
					<h1 className="text-3xl font-bold font-headline">All Papers</h1>
				</div>
				<p className="text-muted-foreground">
					Discover and explore research papers from various academic
					disciplines.
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
				<div className="flex flex-1 gap-4">
					{/* Search */}
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search papers..."
							className="pl-8 pr-8"
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

					{/* Category Filter */}
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-2">
					{/* Sort */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-1">
								<ListFilter className="h-3.5 w-3.5" />
								Sort
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
							<DropdownMenuCheckboxItem
								checked={sortBy === "alphabetical"}
								onCheckedChange={() => setSortBy("alphabetical")}
							>
								Alphabetical
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Active Filters */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2 mb-6">
					{searchQuery && (
						<Badge variant="secondary" className="gap-1">
							Search: "{searchQuery}"
							<button onClick={() => setSearchQuery("")}>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
					{selectedCategory !== "all" && (
						<Badge variant="secondary" className="gap-1">
							Category:{" "}
							{categories.find((c) => c.id === selectedCategory)?.name}
							<button onClick={() => setSelectedCategory("all")}>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
				</div>
			)}

			{/* Results */}
			<div className="mb-4">
				<p className="text-sm text-muted-foreground">
					{filteredAndSortedPapers.length}{" "}
					{filteredAndSortedPapers.length === 1 ? "paper" : "papers"} found
				</p>
			</div>

			{/* Papers Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredAndSortedPapers.length > 0 ? (
					filteredAndSortedPapers.map((paper) => (
						<PaperCard key={paper.id} paper={paper} />
					))
				) : (
					<div className="col-span-full text-center py-12">
						<BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
						<p className="text-lg font-medium text-muted-foreground mb-2">
							No papers found
						</p>
						<p className="text-sm text-muted-foreground">
							{hasActiveFilters
								? "Try adjusting your filters or search terms"
								: "No papers have been uploaded yet"}
						</p>
						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters} className="mt-4">
								Clear all filters
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
