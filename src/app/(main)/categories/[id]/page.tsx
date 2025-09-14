"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useCategories } from "@/hooks/use-categories";
import { usePapers } from "@/hooks/use-papers";
import { PaperCard } from "@/components/paper-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { ListFilter, Search } from "lucide-react";
import type { Category, Paper } from "@/lib/types";

export default function CategoryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [id, setId] = useState<string>("");
	const [category, setCategory] = useState<Category | null>(null);
	const [papersInCategory, setPapersInCategory] = useState<Paper[]>([]);

	const { categories, isLoading: categoriesLoading } = useCategories();
	const { papers, isLoading: papersLoading } = usePapers();

	useEffect(() => {
		params.then(({ id: paramId }) => {
			setId(paramId);
		});
	}, [params]);

	useEffect(() => {
		if (id && categories.length > 0) {
			const foundCategory = categories.find((c) => c.id === id);
			setCategory(foundCategory || null);
		}
	}, [id, categories]);

	useEffect(() => {
		if (id && papers.length > 0) {
			const filtered = papers.filter(
				(p) => p.categoryId.toString() === id && p.status === "approved"
			);
			setPapersInCategory(filtered);
		}
	}, [id, papers]);

	if (categoriesLoading || papersLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
					<div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
				</div>
				<div className="flex items-center justify-between mb-6">
					<div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
					<div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
				</div>
				<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<Card key={index} className="animate-pulse">
							<CardHeader>
								<div className="h-6 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded"></div>
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!category) {
		notFound();
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold font-headline">{category.name}</h1>
				<p className="text-muted-foreground">{category.description}</p>
			</div>

			<div className="flex items-center justify-between mb-6">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={`Search in ${category.name}...`}
						className="pl-8"
					/>
				</div>
				<Button variant="outline" className="gap-1.5">
					<ListFilter className="h-4 w-4" />
					Filter
				</Button>
			</div>

			{papersInCategory.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
					{papersInCategory.map((paper) => (
						<PaperCard key={paper.id} paper={paper} />
					))}
				</div>
			) : (
				<div className="text-center py-20 border-2 border-dashed rounded-lg">
					<h2 className="text-xl font-semibold">No Papers Found</h2>
					<p className="mt-2 text-muted-foreground">
						There are no approved papers in this category yet.
					</p>
				</div>
			)}
		</div>
	);
}
