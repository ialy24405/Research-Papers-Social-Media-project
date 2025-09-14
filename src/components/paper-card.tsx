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
} from "lucide-react";
import type { Paper } from "@/lib/types";
import { getPlaceholderImage } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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
							{paper.name}
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
							<DropdownMenuItem>View Details</DropdownMenuItem>
							<DropdownMenuItem>Share</DropdownMenuItem>
							<DropdownMenuItem>Save</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Avatar className="h-6 w-6">
						<AvatarImage src={paper.authorAvatar || undefined} alt={paper.authorName} />
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
				<div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-1">
						<Heart className="h-4 w-4" /> {paper.interactions.reactions}
					</div>
					<div className="flex items-center gap-1">
						<MessageCircle className="h-4 w-4" /> {paper.interactions.comments}
					</div>
					<div className="flex items-center gap-1">
						<Bookmark className="h-4 w-4" /> {paper.interactions.saves}
					</div>
				</div>
				<div className="flex w-full items-center gap-2">
					<Button variant="outline" size="sm" className="flex-1 min-w-0">
						<Heart className="mr-2 h-4 w-4" /> React
					</Button>
					<Button variant="outline" size="sm" className="flex-1 min-w-0">
						<MessageCircle className="mr-2 h-4 w-4" /> Comment
					</Button>
					<Button variant="outline" size="icon" className="shrink-0">
						<Bookmark className="h-4 w-4" />
						<span className="sr-only">Save</span>
					</Button>
					<Button variant="outline" size="icon" className="shrink-0">
						<Download className="h-4 w-4" />
						<span className="sr-only">Download</span>
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}
