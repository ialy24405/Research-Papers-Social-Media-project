"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePapers } from "@/hooks/use-papers";
import { dummyUser } from "@/lib/data";
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
import { getBackendUrl } from "@/lib/config";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import type { Paper } from "@/lib/types";

export default function PaperPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [id, setId] = useState<string>("");
	const [paper, setPaper] = useState<Paper | null>(null);
	const { papers, isLoading } = usePapers();
	const router = useRouter();

	useEffect(() => {
		params.then(({ id: paramId }) => {
			setId(paramId);
		});
	}, [params]);

	useEffect(() => {
		if (id && papers.length > 0) {
			const foundPaper = papers.find((p) => p.id === parseInt(id));
			setPaper(foundPaper || null);
		}
	}, [id, papers]);

	if (isLoading) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<main className="md:col-span-2 space-y-8">
						<div className="animate-pulse">
							<div className="h-8 bg-gray-200 rounded mb-4"></div>
							<div className="h-4 bg-gray-200 rounded mb-2"></div>
							<div className="h-20 bg-gray-200 rounded"></div>
						</div>
					</main>
					<aside className="space-y-8">
						<div className="animate-pulse">
							<div className="h-6 bg-gray-200 rounded mb-4"></div>
							<div className="h-32 bg-gray-200 rounded"></div>
						</div>
					</aside>
				</div>
			</div>
		);
	}

	if (!paper) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="text-center py-20">
					<h1 className="text-2xl font-bold mb-4">Paper Not Found</h1>
					<p className="text-muted-foreground mb-4">
						The paper you're looking for doesn't exist.
					</p>
					<Button onClick={() => router.push("/home")}>Go Back Home</Button>
				</div>
			</div>
		);
	}

	// Frontend only: Use existing papers as related papers
	const relatedPapers = papers
		.filter((p) => p.categoryId === paper.categoryId && p.id !== paper.id)
		.slice(0, 5)
		.map((p) => ({
			id: p.id,
			title: p.name,
			author: p.authorName,
			description: p.description,
		}));

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
									{paper.authorAvatar ? (
										<AvatarImage
											src={paper.authorAvatar || undefined}
											alt={paper.authorName}
										/>
									) : (
										<AvatarFallback>
											{paper.authorName.charAt(0)}
										</AvatarFallback>
									)}
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
					{/* <section>
						<div className="bg-secondary p-4 rounded-lg">
							<h3 className="font-headline font-semibold text-lg flex items-center gap-2 mb-2">
								<Lightbulb className="w-5 h-5 text-accent" />
								AI-Generated Summary
							</h3>
							<p className="text-sm text-secondary-foreground">
								{paper.description}
							</p>
						</div>
					</section> */}

					{/* PDF Viewer */}
					<section>
						<h2 className="text-2xl font-bold font-headline mb-4">
							Paper Document
						</h2>
						<div className="w-full border rounded-lg overflow-hidden bg-background">
							{paper.pdfUrl ? (
								(() => {
									const pdfUrl = paper.pdfUrl.startsWith("http")
										? paper.pdfUrl
										: getBackendUrl(paper.pdfUrl);

									// Function to handle PDF download
									const handleDownload = async () => {
										try {
											console.log("Starting download for:", pdfUrl);
											const response = await fetch(pdfUrl, {
												mode: "cors",
												credentials: "same-origin",
											});

											if (!response.ok) {
												throw new Error(
													`HTTP error! status: ${response.status}`
												);
											}

											const contentType = response.headers.get("content-type");
											console.log("Content type:", contentType);

											const blob = await response.blob();
											console.log("Blob size:", blob.size);

											const url = window.URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = `${paper.name.replace(
												/[^a-z0-9]/gi,
												"_"
											)}.pdf`;
											a.style.display = "none";
											document.body.appendChild(a);
											a.click();

											// Clean up
											setTimeout(() => {
												window.URL.revokeObjectURL(url);
												document.body.removeChild(a);
											}, 100);

											console.log("Download initiated successfully");
										} catch (error) {
											console.error("Download failed:", error);
											alert("Download failed. Opening PDF in new tab instead.");
											// Fallback: open in new tab
											window.open(pdfUrl, "_blank");
										}
									};

									return (
										<div className="space-y-4">
											{/* PDF Display - Multiple Methods */}
											<div className="border rounded-lg overflow-hidden bg-white">
												{/* Method 1: Object tag with embed fallback */}
												<object
													data={pdfUrl}
													type="application/pdf"
													width="100%"
													height="800px"
													className="block"
												>
													{/* Fallback 1: Embed tag */}
													<embed
														src={pdfUrl}
														type="application/pdf"
														width="100%"
														height="800px"
													/>

													{/* Fallback 2: Manual options */}
													<div className="p-8 text-center space-y-4">
														<div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
															<svg
																className="w-8 h-8 text-muted-foreground"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																/>
															</svg>
														</div>
														<div>
															<h3 className="text-lg font-semibold mb-2">
																PDF Viewer Not Available
															</h3>
															<p className="text-muted-foreground mb-4">
																Your browser doesn't support inline PDF viewing.
															</p>
															<div className="flex gap-2 justify-center">
																<Button asChild>
																	<a
																		href={pdfUrl}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		Open PDF in New Tab
																	</a>
																</Button>
																<Button
																	variant="outline"
																	onClick={handleDownload}
																>
																	Download PDF
																</Button>
															</div>
														</div>
													</div>
												</object>
											</div>
										</div>
									);
								})()
							) : (
								<div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
									<div className="text-center space-y-2">
										<div className="w-16 h-16 mx-auto bg-muted-foreground/10 rounded-lg flex items-center justify-center">
											<svg
												className="w-8 h-8 text-muted-foreground"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
										</div>
										<p className="text-muted-foreground font-medium">
											PDF document not available
										</p>
										<p className="text-sm text-muted-foreground">
											The PDF file for this paper is not currently accessible
										</p>
									</div>
								</div>
							)}
						</div>
						{paper.pdfUrl && (
							<div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
								<p>
									Having trouble viewing? Try opening in a{" "}
									<a
										href={
											paper.pdfUrl.startsWith("http")
												? paper.pdfUrl
												: getBackendUrl(paper.pdfUrl)
										}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										new tab
									</a>
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										const pdfUrl = paper.pdfUrl.startsWith("http")
											? paper.pdfUrl
											: getBackendUrl(paper.pdfUrl);

										fetch(pdfUrl, { mode: "cors" })
											.then((response) => response.blob())
											.then((blob) => {
												const url = window.URL.createObjectURL(blob);
												const a = document.createElement("a");
												a.href = url;
												a.download = `${paper.name.replace(
													/[^a-z0-9]/gi,
													"_"
												)}.pdf`;
												document.body.appendChild(a);
												a.click();
												window.URL.revokeObjectURL(url);
												document.body.removeChild(a);
											})
											.catch(() => window.open(pdfUrl, "_blank"));
									}}
								>
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</Button>
							</div>
						)}
					</section>

					<Separator />

					{/* Interaction Section */}
					<section>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-6 text-sm text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<Heart className="h-5 w-5" /> {paper.reactionCount} Reactions
								</span>
								<span className="flex items-center gap-1.5">
									<MessageCircle className="h-5 w-5" /> {paper.commentCount}{" "}
									Comments
								</span>
								<span className="flex items-center gap-1.5">
									<Bookmark className="h-5 w-5" /> {paper.saveCount} Saves
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
							<Button
								size="icon"
								className="h-11 w-11"
								onClick={() => {
									if (paper.pdfUrl) {
										const pdfUrl = paper.pdfUrl.startsWith("http")
											? paper.pdfUrl
											: getBackendUrl(paper.pdfUrl);

										fetch(pdfUrl, { mode: "cors" })
											.then((response) => response.blob())
											.then((blob) => {
												const url = window.URL.createObjectURL(blob);
												const a = document.createElement("a");
												a.href = url;
												a.download = `${paper.name.replace(
													/[^a-z0-9]/gi,
													"_"
												)}.pdf`;
												document.body.appendChild(a);
												a.click();
												window.URL.revokeObjectURL(url);
												document.body.removeChild(a);
											})
											.catch(() => window.open(pdfUrl, "_blank"));
									}
								}}
							>
								<Download className="h-5 w-5" />
							</Button>
						</div>
					</section>

					<Separator />

					{/* Comments Section */}
					<section>
						<h2 className="text-2xl font-bold font-headline mb-4">
							Comments ({paper.commentCount})
						</h2>
						<div className="flex items-start gap-4">
							<Avatar>
								<AvatarImage src={dummyUser.avatarUrl || undefined} />
								<AvatarFallback>{dummyUser.fullName.charAt(0)}</AvatarFallback>
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
									{relatedPapers.map((relatedPaper, index) => (
										<CarouselItem key={index} className="md:basis-full">
											<div className="p-1">
												<Card>
													<CardContent className="flex flex-col items-start gap-2 p-4">
														<h4 className="font-semibold text-sm leading-snug hover:text-primary">
															<Link href={`/papers/${relatedPaper.id}`}>
																{relatedPaper.title}
															</Link>
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
