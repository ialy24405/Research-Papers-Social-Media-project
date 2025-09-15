"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import {
	togglePaperSave,
	isPaperSaved,
	subscribeToSaveChanges,
} from "@/lib/save-utils";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
	paperId: number;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	showText?: boolean;
	onSaveChange?: (isSaved: boolean) => void;
}

export function SaveButton({
	paperId,
	variant = "outline",
	size = "default",
	className,
	showText = false,
	onSaveChange,
}: SaveButtonProps) {
	const [isSaved, setIsSaved] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Initialize save status
		setIsSaved(isPaperSaved(paperId));

		// Subscribe to save changes
		const unsubscribe = subscribeToSaveChanges(paperId, (data) => {
			setIsSaved(data.isSaved);
			if (onSaveChange) {
				onSaveChange(data.isSaved);
			}
		});

		return unsubscribe;
	}, [paperId]);

	const handleSaveToggle = async () => {
		setIsLoading(true);
		try {
			const result = await togglePaperSave(paperId, {
				showAlert: false,
				optimistic: true,
			});

			if (result.success && typeof result.isSaved === "boolean") {
				setIsSaved(result.isSaved);
				if (onSaveChange) {
					onSaveChange(result.isSaved);
				}
			}
		} catch (error) {
			console.error("Failed to toggle save:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleSaveToggle}
			disabled={isLoading}
			className={cn(
				"transition-colors",
				isSaved && "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
				className
			)}
		>
			<Bookmark
				className={cn(
					"h-4 w-4",
					size === "lg" && "h-5 w-5",
					size === "sm" && "h-3 w-3",
					isSaved && "fill-current"
				)}
			/>
			{showText && <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>}
		</Button>
	);
}
