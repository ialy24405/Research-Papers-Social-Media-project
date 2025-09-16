"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Heart, ThumbsUp, Lightbulb, Zap, Target, Star } from "lucide-react";
import { ReactionData } from "@/lib/reaction-utils";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
	onReactionSelect: (reactionType: ReactionData["type"]) => void;
	currentReaction?: ReactionData["type"] | null;
	isLoading?: boolean;
	children?: React.ReactNode;
	size?: "sm" | "lg";
}

const reactionTypes: Array<{
	type: ReactionData["type"];
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	color: string;
	bgColor: string;
}> = [
	{
		type: "like",
		icon: Heart,
		label: "Like",
		color: "text-red-500",
		bgColor: "hover:bg-red-50",
	},
	{
		type: "love",
		icon: Star,
		label: "Love",
		color: "text-pink-500",
		bgColor: "hover:bg-pink-50",
	},
	{
		type: "support",
		icon: ThumbsUp,
		label: "Support",
		color: "text-blue-500",
		bgColor: "hover:bg-blue-50",
	},
	{
		type: "insightful",
		icon: Lightbulb,
		label: "Insightful",
		color: "text-yellow-500",
		bgColor: "hover:bg-yellow-50",
	},
];

export function ReactionPicker({
	onReactionSelect,
	currentReaction,
	isLoading,
	children,
	size = "lg",
}: ReactionPickerProps) {
	// If a child element is provided (custom trigger), make it toggle reaction on click
	if (children) {
		const handleClick = () => {
			if (isLoading) return;
			if (currentReaction) {
				onReactionSelect(currentReaction);
			} else {
				onReactionSelect("like");
			}
		};
		return <div onClick={handleClick} className="cursor-pointer">{children}</div>;
	}

	const [open, setOpen] = useState(false);

	const handleReactionClick = (reactionType: ReactionData["type"]) => {
		onReactionSelect(reactionType);
		setOpen(false);
	};

	// Find current reaction details
	const currentReactionData = reactionTypes.find(
		(r) => r.type === currentReaction
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{children || (
					<Button
						variant={currentReaction ? "default" : "outline"}
						size={size}
						className={cn(
							"flex-1",
							currentReactionData &&
								`${currentReactionData.color} border-current`
						)}
						disabled={isLoading}
					>
						{currentReactionData ? (
							<>
								<currentReactionData.icon
									className={`mr-2 h-4 w-4 ${currentReactionData.color} fill-current`}
								/>
								{currentReactionData.label}
							</>
						) : (
							<>
								<Heart className="mr-2 h-4 w-4" />
								React
							</>
						)}
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-56 p-2" align="start">
				<div className="grid grid-cols-2 gap-1">
					{reactionTypes.map((reaction) => {
						const Icon = reaction.icon;
						const isSelected = currentReaction === reaction.type;

						return (
							<Button
								key={reaction.type}
								variant="ghost"
								size="sm"
								className={cn(
									"flex flex-col items-center gap-1 h-auto py-3 px-2",
									reaction.bgColor,
									isSelected && "bg-secondary ring-2 ring-primary"
								)}
								onClick={() => handleReactionClick(reaction.type)}
								disabled={isLoading}
							>
								<Icon
									className={cn(
										"h-6 w-6",
										reaction.color,
										isSelected && "fill-current"
									)}
								/>
								<span className={cn("text-xs font-medium", reaction.color)}>
									{reaction.label}
								</span>
							</Button>
						);
					})}
				</div>

				{currentReaction && (
					<>
						<div className="border-t my-2" />
						<Button
							variant="ghost"
							size="sm"
							className="w-full text-muted-foreground hover:text-destructive"
							onClick={() => handleReactionClick(currentReaction)}
							disabled={isLoading}
						>
							Remove reaction
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
