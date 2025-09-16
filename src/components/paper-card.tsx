"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Bookmark,
	Download,
	Heart,
	MessageCircle,
	MoreVertical,
	Share2,
	Star,
	ThumbsUp,
	Lightbulb,
} from "lucide-react";
import type { Paper } from "@/lib/types";
import { getPlaceholderImage } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { createDownloadHandler } from "@/lib/download-utils";
import { createShareHandler } from "@/lib/share-utils";
import { usePaperReaction } from "@/hooks/use-paper-reaction";
import { SaveButton } from "@/components/save-button";
import { ReactionPicker } from "@/components/reaction-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PaperCardProps {
	paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
	const [timeAgo, setTimeAgo] = useState("");
	const {
		count: reactionCount,
		currentReaction,
		stats,
		toggleReaction,
		isLoading,
	} = usePaperReaction(paper.id);

	// Map reaction types to icons and colors
	const ReactionIcon =
		currentReaction === "love"
			? Star
			: currentReaction === "support"
			? ThumbsUp
			: currentReaction === "insightful"
			? Lightbulb
			: Heart;
	const reactionColor =
		currentReaction === "love"
			? "text-pink-500"
			: currentReaction === "support"
			? "text-blue-500"
			: currentReaction === "insightful"
			? "text-yellow-500"
			: "text-red-500";

	useEffect(() => {
		setTimeAgo(
			formatDistanceToNow(new Date(paper.createdAt), { addSuffix: true })
		);
	}, [paper.createdAt]);

	const statusVariant = {
		approved: "default",
		pending: "secondary",
		rejected: "destructive",
	} as const;
	return (
		<Card className="flex flex-col">
			<CardHeader>
				<div className="flex items-start justify-between">
					<Link href={`/papers/${paper.id}`} className="flex-1">
						<CardTitle className="font-headline text-lg hover:text-primary transition-colors">
							{paper.title}
						</CardTitle>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 -mt-2 -mr-2 flex-shrink-0"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{/* <DropdownMenuItem>View Details</DropdownMenuItem> */}
							<DropdownMenuItem onClick={createShareHandler(paper)}>
								<Share2 className="mr-2 h-4 w-4" />
								Share
							</DropdownMenuItem>
							{/* <DropdownMenuItem>Save</DropdownMenuItem> */}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Avatar className="h-6 w-6">
						<AvatarImage
							src={paper.authorAvatar || undefined}
							alt={paper.authorName}
						/>
						<AvatarFallback>{paper.authorName.charAt(0)}</AvatarFallback>
					</Avatar>
					<span>{paper.authorName}</span>
					<span className="text-xs">&bull;</span>
					<time dateTime={paper.createdAt}>{timeAgo}</time>
				</div>
			</CardHeader>
			<CardContent className="flex-1">
				<CardDescription>{paper.description}</CardDescription>
			</CardContent>
			<CardFooter className="flex-col items-start gap-4">
				{/* Stats row: reactions, comments, saves */}
				<div className="flex items-center flex-wrap gap-4 text-sm">
					<ReactionPicker
						onReactionSelect={toggleReaction}
						currentReaction={currentReaction}
						isLoading={isLoading}
						size="sm"
					>
						<div
							className={`flex items-center gap-1 cursor-pointer ${reactionColor}`}
						>
							<ReactionIcon
								className={`h-4 w-4 ${reactionColor}`}
							/>
							<span>{reactionCount}</span>
						</div>
					</ReactionPicker>
					<div className="flex items-center gap-1 text-muted-foreground">
						<MessageCircle className="h-4 w-4" />{" "}
						{paper.interactions?.comments || 0}
					</div>
					<div className="flex items-center gap-1 text-muted-foreground">
						<Bookmark className="h-4 w-4" /> {paper.interactions?.saves || 0}
					</div>
				</div>

				{/* Actions row: comment, save, download */}
				<div className="flex w-full items-center gap-2">
					<Button variant="outline" size="sm" className="flex-1 min-w-0">
						<MessageCircle className="mr-2 h-4 w-4" /> Comment
					</Button>
					<SaveButton
						paperId={paper.id}
						variant="outline"
						size="icon"
						className="shrink-0"
					/>
					<Button
						variant="outline"
						size="icon"
						className="shrink-0"
						onClick={
							paper.pdfUrl
								? createDownloadHandler(paper.pdfUrl, paper.name)
								: undefined
						}
						disabled={!paper.pdfUrl}
					>
						<Download className="h-4 w-4" />
						<span className="sr-only">Download</span>
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
