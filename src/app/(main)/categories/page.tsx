"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function CategoriesPage() {
	const { categories, isLoading, error } = useCategories();

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold font-headline">All Categories</h1>
					<p className="text-muted-foreground">
						Explore papers across a wide range of academic disciplines.
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, index) => (
						<Card key={index} className="overflow-hidden animate-pulse h-full">
							<div className="h-48 w-full bg-gray-200"></div>
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

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold font-headline">All Categories</h1>
					<p className="text-muted-foreground">
						Explore papers across a wide range of academic disciplines.
					</p>
				</div>
				<div className="text-center py-8">
					<p className="text-red-600 mb-4">Error loading categories: {error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold font-headline">All Categories</h1>
				<p className="text-muted-foreground">
					Explore papers across a wide range of academic disciplines.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{categories.map((category) => (
					<Link key={category.id} href={`/categories/${category.id}`}>
						<Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
							<div className="relative h-48 w-full">
								<Image
									src={category.imageUrl || "/placeholder-category.jpg"}
									alt={category.name}
									fill
									className="object-cover group-hover:scale-105 transition-transform"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
							</div>
							<CardHeader className="relative -mt-20 z-10">
								<CardTitle className="font-headline text-primary-foreground text-xl">
									{category.name}
								</CardTitle>
								<CardDescription className="text-primary-foreground/80 line-clamp-2">
									{category.description}
								</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
