"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/lib/types";

interface CategoryCardProps {
	category: Category;
	variant?: "default" | "compact";
}

export function CategoryCard({
	category,
	variant = "default",
}: CategoryCardProps) {
	const isCompact = variant === "compact";

	return (
		<Link href={`/categories/${category.id}`}>
			<Card className="group border-0 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out h-full">
				<CardContent className={isCompact ? "p-6" : "p-8"}>
					<div className="flex items-center justify-between mb-4">
						<div
							className={`${
								isCompact ? "w-10 h-10" : "w-12 h-12"
							} rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
						>
							<div
								className={`${
									isCompact ? "w-5 h-5" : "w-6 h-6"
								} rounded-lg bg-gradient-to-br from-primary to-accent`}
							></div>
						</div>
						<div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
					</div>
					<div className="space-y-2">
						<h3
							className={`font-headline font-bold ${
								isCompact ? "text-lg" : "text-xl"
							} text-foreground group-hover:text-primary transition-colors duration-300`}
						>
							{category.name}
						</h3>
						<p
							className={`${
								isCompact ? "text-xs" : "text-sm"
							} text-muted-foreground line-clamp-2 leading-relaxed`}
						>
							{category.description}
						</p>
					</div>
					<div
						className={`${
							isCompact ? "mt-4" : "mt-6"
						} flex items-center text-xs text-primary font-medium group-hover:translate-x-1 transition-transform duration-300`}
					>
						Explore category
						<svg
							className="ml-1 w-3 h-3"
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
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

export function CategoryCardSkeleton({
	variant = "default",
}: {
	variant?: "default" | "compact";
}) {
	const isCompact = variant === "compact";

	return (
		<Card className="border-0 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm animate-pulse h-full">
			<CardContent className={isCompact ? "p-6" : "p-8"}>
				<div className="flex items-center justify-between mb-4">
					<div
						className={`${
							isCompact ? "w-10 h-10" : "w-12 h-12"
						} rounded-2xl bg-gray-200/50`}
					></div>
					<div className="w-2 h-2 rounded-full bg-gray-200/50"></div>
				</div>
				<div className="space-y-2">
					<div
						className={`${
							isCompact ? "h-5" : "h-6"
						} bg-gray-200/50 rounded-lg w-3/4`}
					></div>
					<div className="h-4 bg-gray-200/50 rounded w-full"></div>
					<div className="h-4 bg-gray-200/50 rounded w-2/3"></div>
				</div>
				<div className={isCompact ? "mt-4" : "mt-6"}>
					<div className="h-4 bg-gray-200/50 rounded w-1/2"></div>
				</div>
			</CardContent>
		</Card>
	);
}
