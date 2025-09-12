import { notFound } from "next/navigation";
import { papers, dummyUser, categories } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Bookmark,
	Download,
	Heart,
	MessageCircle,
	Share2,
	Lightbulb,
} from "lucide-react";
import { format } from "date-fns";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { getPlaceholderImage } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default async function PaperPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const paper = papers.find((p) => p.id === id);

	if (!paper) {
		notFound();
	}

	// Frontend only: Use existing papers as related papers
	const relatedPapers = {
		relatedPapers: papers
			.filter((p) => p.categoryId === paper.categoryId && p.id !== paper.id)
			.slice(0, 5)
			.map((p) => ({
				title: p.name,
				author: p.authorName,
				description: p.description,
			})),
	};

	return (
		<div className="container mx-auto max-w-5xl py-8">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<main className="md:col-span-2 space-y-8">
					{/* Paper Header */}
					<section>
						<h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
							{paper.name}
						</h1>
						<div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={paper.authorAvatar}
										alt={paper.authorName}
									/>
									<AvatarFallback>{paper.authorName.charAt(0)}</AvatarFallback>
								</Avatar>
								<span className="font-medium text-foreground">
									{paper.authorName}
								</span>
							</div>
							<Separator orientation="vertical" className="h-4" />
							<time dateTime={paper.createdAt}>
								{format(new Date(paper.createdAt), "MMMM d, yyyy")}
							</time>
						</div>
						<p className="mt-4 text-lg text-muted-foreground">
							{paper.description}
						</p>
					</section>

					<Separator />

					{/* AI Summary */}
					<section>
						<div className="bg-secondary p-4 rounded-lg">
							<h3 className="font-headline font-semibold text-lg flex items-center gap-2 mb-2">
								<Lightbulb className="w-5 h-5 text-accent" />
								AI-Generated Summary
							</h3>
							<p className="text-sm text-secondary-foreground">
								{paper.summary}
							</p>
						</div>
					</section>

					{/* PDF Viewer Placeholder */}
					<section>
						<h2 className="text-2xl font-bold font-headline mb-4">
							Paper Document
						</h2>
						<div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
							<p className="text-muted-foreground">PDF Viewer Placeholder</p>
						</div>
					</section>

					<Separator />

					{/* Interaction Section */}
					<section>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-6 text-sm text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<Heart className="h-5 w-5" /> {paper.interactions.reactions}{" "}
									Reactions
								</span>
								<span className="flex items-center gap-1.5">
									<MessageCircle className="h-5 w-5" />{" "}
									{paper.interactions.comments} Comments
								</span>
								<span className="flex items-center gap-1.5">
									<Bookmark className="h-5 w-5" /> {paper.interactions.saves}{" "}
									Saves
								</span>
							</div>
							<Button variant="outline">
								<Share2 className="mr-2 h-4 w-4" /> Share
							</Button>
						</div>
						<div className="mt-6 flex items-center gap-2">
							<Button variant="outline" size="lg" className="flex-1">
								<Heart className="mr-2 h-4 w-4" /> React
							</Button>
							<Button variant="outline" size="lg" className="flex-1">
								<MessageCircle className="mr-2 h-4 w-4" /> Comment
							</Button>
							<Button variant="outline" size="icon" className="h-11 w-11">
								<Bookmark className="h-5 w-5" />
							</Button>
							<Button size="icon" className="h-11 w-11">
								<Download className="h-5 w-5" />
							</Button>
						</div>
					</section>

					<Separator />

					{/* Comments Section */}
					<section>
						<h2 className="text-2xl font-bold font-headline mb-4">
							Comments ({paper.interactions.comments})
						</h2>
						<div className="flex items-start gap-4">
							<Avatar>
								<AvatarImage src={dummyUser.avatarUrl} />
								<AvatarFallback>{dummyUser.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div className="w-full">
								<Textarea
									placeholder="Add a public comment..."
									className="mb-2"
								/>
								<div className="flex justify-end">
									<Button>Comment</Button>
								</div>
							</div>
						</div>
						{/* Placeholder for comments list */}
					</section>
				</main>

				<aside className="space-y-8">
					{/* Related Papers */}
					<section>
						<h3 className="text-xl font-bold font-headline mb-4">
							Related Papers
						</h3>
						<div className="relative">
							<Carousel opts={{ align: "start" }} className="w-full">
								<CarouselContent>
									{relatedPapers.relatedPapers.map((relatedPaper, index) => (
										<CarouselItem key={index} className="md:basis-full">
											<div className="p-1">
												<Card>
													<CardContent className="flex flex-col items-start gap-2 p-4">
														<h4 className="font-semibold text-sm leading-snug hover:text-primary">
															<Link href="#">{relatedPaper.title}</Link>
														</h4>
														<p className="text-xs text-muted-foreground">
															by {relatedPaper.author}
														</p>
														<p className="text-sm text-muted-foreground line-clamp-2">
															{relatedPaper.description}
														</p>
													</CardContent>
												</Card>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="-left-4" />
								<CarouselNext className="-right-4" />
							</Carousel>
						</div>
					</section>
				</aside>
			</div>
		</div>
	);
}
