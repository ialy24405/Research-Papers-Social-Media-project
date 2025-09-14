"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserPapers } from "@/hooks/use-user-papers";
import { useAuth } from "@/hooks/use-auth";
import {
	BarChart,
	MessageCircle,
	MoreHorizontal,
	Eye,
	ThumbsUp,
	AlertCircle,
	Heart,
	Save,
	Share,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function PostStatusPage() {
	const { user, isLoading: authLoading } = useAuth();
	const {
		papers: userPapers = [],
		isLoading: papersLoading,
		error,
	} = useUserPapers();

	const approvedPapers = userPapers.filter((p) => p.status === "approved");
	const pendingPapers = userPapers.filter((p) => p.status === "pending");
	const rejectedPapers = userPapers.filter((p) => p.status === "rejected");

	console.log("User papers:", userPapers);

	if (authLoading || papersLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center text-red-600">Error: {error}</div>
			</div>
		);
	}
	const statusVariant = {
		approved: "default",
		pending: "secondary",
		rejected: "destructive",
	} as const;

	const StatusTable = ({ papers }: { papers: typeof userPapers }) => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					<TableHead className="hidden md:table-cell">Status</TableHead>
					<TableHead className="hidden md:table-cell text-center">
						Interactions
					</TableHead>
					<TableHead>
						<span className="sr-only">Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{papers.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={4}
							className="text-center py-8 text-muted-foreground"
						>
							No papers found.{" "}
							<Link href="/upload" className="text-primary hover:underline">
								Upload your first paper
							</Link>
						</TableCell>
					</TableRow>
				) : (
					papers.map((paper) => (
						<TableRow key={paper.id}>
							<TableCell className="font-medium">
								<div className="truncate w-40 md:w-full">{paper.name}</div>
								<div className="text-muted-foreground text-xs md:hidden">
									<Badge
										variant={statusVariant[paper.status]}
										className="capitalize"
									>
										{paper.status}
									</Badge>
								</div>
							</TableCell>
							<TableCell className="hidden md:table-cell">
								<Badge
									variant={statusVariant[paper.status]}
									className="capitalize"
								>
									{paper.status}
								</Badge>
							</TableCell>
							<TableCell className="hidden md:table-cell text-center">
								{paper.status === "approved" ? (
									<div className="flex justify-center items-center gap-3 text-muted-foreground">
										<span className="flex items-center gap-1">
											<Heart className="w-4 h-4" />{" "}
											{paper.interactions.reactions}
										</span>
										<span className="flex items-center gap-1">
											<MessageCircle className="w-4 h-4" />{" "}
											{paper.interactions.comments}
										</span>
										<span className="flex items-center gap-1">
											<Save className="w-4 h-4" /> {paper.interactions.saves}
										</span>
									</div>
								) : paper.status === "rejected" ? (
									<div className="flex items-center justify-center gap-2 text-destructive">
										<AlertCircle className="w-4 h-4" />
										<span>Rejected</span>
									</div>
								) : (
									<span className="text-muted-foreground text-sm">
										Awaiting Review
									</span>
								)}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button aria-haspopup="true" size="icon" variant="ghost">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Toggle menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{paper.status === "approved" && (
											<>
												<DropdownMenuItem asChild>
													<Link href={`/papers/${paper.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Post
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BarChart className="mr-2 h-4 w-4" />
													View Stats
												</DropdownMenuItem>
											</>
										)}
										{paper.status === "rejected" && (
											<DropdownMenuItem disabled>
												<div className="flex flex-col">
													<span className="font-semibold">
														Rejection Reason
													</span>
													<p className="text-xs text-muted-foreground whitespace-normal">
														{paper.rejectionReason}
													</p>
												</div>
											</DropdownMenuItem>
										)}
										{paper.status === "pending" && (
											<DropdownMenuItem disabled>
												No actions available
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);

	return (
		<div className="container mx-auto py-8">
			<Card>
				<CardHeader>
					<CardTitle className="font-headline text-2xl">
						My Submitted Papers
					</CardTitle>
					<CardDescription>
						Track the review status and performance of your submissions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="all">
						<TabsList>
							<TabsTrigger value="all">All ({userPapers.length})</TabsTrigger>
							<TabsTrigger value="approved">
								Approved ({approvedPapers.length})
							</TabsTrigger>
							<TabsTrigger value="pending">
								Pending ({pendingPapers.length})
							</TabsTrigger>
							<TabsTrigger value="rejected">
								Rejected ({rejectedPapers.length})
							</TabsTrigger>
						</TabsList>
						<TabsContent value="all">
							<StatusTable papers={userPapers} />
						</TabsContent>
						<TabsContent value="approved">
							<StatusTable papers={approvedPapers} />
						</TabsContent>
						<TabsContent value="pending">
							<StatusTable papers={pendingPapers} />
						</TabsContent>
						<TabsContent value="rejected">
							<StatusTable papers={rejectedPapers} />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
