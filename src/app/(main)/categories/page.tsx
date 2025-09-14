"use client";

import { useCategories } from "@/hooks/use-categories";
import { CategoryCard, CategoryCardSkeleton } from "@/components/category-card";

export default function CategoriesPage() {
	const { categories, isLoading, error } = useCategories();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold font-headline">All Categories</h1>
					<p className="text-muted-foreground mt-2">
						Explore papers across a wide range of academic disciplines.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, index) => (
						<CategoryCardSkeleton key={index} variant="compact" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold font-headline">All Categories</h1>
					<p className="text-muted-foreground mt-2">
						Explore papers across a wide range of academic disciplines.
					</p>
				</div>
				<div className="text-center py-12">
					<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
						<p className="text-destructive mb-4 font-medium">
							Error loading categories
						</p>
						<p className="text-sm text-muted-foreground mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold font-headline">All Categories</h1>
				<p className="text-muted-foreground mt-2">
					Explore papers across a wide range of academic disciplines.
				</p>
			</div>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{categories.map((category) => (
					<CategoryCard
						key={category.id}
						category={category}
						variant="compact"
					/>
				))}
			</div>
		</div>
	);
}
