"use client";

import { useState, useEffect } from "react";
import { categoryService } from "../lib/api";
import type { Category } from "../lib/types";

export function useCategories() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await categoryService.getCategories();
				setCategories(data);
			} catch (err: any) {
				setError(err.error || "Failed to fetch categories");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
	}, []);

	return {
		categories,
		isLoading,
		error,
	};
}
