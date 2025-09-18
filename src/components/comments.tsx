"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, Loader2, Reply } from "lucide-react";
import {
	addComment,
	getComments,
	subscribeToCommentChanges,
	type Comment,
} from "@/lib/comment-utils";
import { useAuth } from "@/contexts/auth-context";

interface CommentsProps {
	paperId: number;
	initialCommentCount?: number;
	onCommentCountChange?: (count: number) => void;
}

export function Comments({
	paperId,
	initialCommentCount = 0,
	onCommentCountChange,
}: CommentsProps) {
	const { user, isAuthenticated } = useAuth();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");

	// Helper function to count total comments including replies
	const getTotalCommentsCount = (commentsList: Comment[]): number => {
		let count = 0;
		for (const comment of commentsList) {
			count += 1; // Count this comment
			if (comment.replies && comment.replies.length > 0) {
				count += getTotalCommentsCount(comment.replies); // Recursively count replies
			}
		}
		return count;
	};

	// Notify parent component when comment count changes
	useEffect(() => {
		if (onCommentCountChange) {
			const totalCount = getTotalCommentsCount(comments);
			onCommentCountChange(totalCount);
		}
	}, [comments, onCommentCountChange]);

	// Fetch comments on component mount
	useEffect(() => {
		const fetchComments = async () => {
			setIsLoading(true);
			const result = await getComments(paperId);

			if (result.success && result.comments) {
				setComments(result.comments);
				setError(null);
			} else {
				setError(result.error || "Failed to load comments");
				setComments([]);
			}

			setIsLoading(false);
		};

		fetchComments();
	}, [paperId]);

	// Subscribe to comment changes
	useEffect(() => {
		const unsubscribe = subscribeToCommentChanges(paperId, () => {
			// Refetch comments when a new comment is added
			getComments(paperId).then((result) => {
				if (result.success && result.comments) {
					setComments(result.comments);
				}
			});
		});

		return unsubscribe;
	}, [paperId]);

	const handleSubmitComment = async () => {
		if (!newComment.trim() || !isAuthenticated) return;

		setIsSubmitting(true);
		setError(null);

		const result = await addComment(paperId, newComment);

		if (result.success) {
			setNewComment("");
			// Comments will be refetched automatically via the event listener
		} else {
			setError(result.error || "Failed to add comment");
		}

		setIsSubmitting(false);
	};

	const handleSubmitReply = async (parentCommentId: number) => {
		if (!replyText.trim() || !isAuthenticated) return;

		setIsSubmitting(true);
		setError(null);

		const result = await addComment(paperId, replyText, parentCommentId);

		if (result.success) {
			setReplyText("");
			setReplyingTo(null);
			// Comments will be refetched automatically via the event listener
		} else {
			setError(result.error || "Failed to add reply");
		}

		setIsSubmitting(false);
	};

	const handleCancelReply = () => {
		setReplyingTo(null);
		setReplyText("");
		setError(null);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			handleSubmitComment();
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
		if (diffInMinutes < 10080)
			return `${Math.floor(diffInMinutes / 1440)}d ago`;

		return date.toLocaleDateString();
	};

	const renderComment = (comment: Comment, depth: number = 0) => {
		const isReplying = replyingTo === comment.id;
		const maxDepth = 3; // Limit nesting depth

		return (
			<div key={comment.id} className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
				<Card
					className={`border-l-4 ${
						depth === 0 ? "border-l-blue-500" : "border-l-gray-300"
					}`}
				>
					<CardContent className="p-4">
						<div className="flex gap-3">
							<Avatar className="h-8 w-8">
								{comment.user?.avatarUrl ? (
									<AvatarImage src={comment.user.avatarUrl} />
								) : (
									<AvatarFallback>
										{comment.user?.name?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">
										{comment.user?.name || "Unknown User"}
									</span>
									<span className="text-xs text-muted-foreground">
										{formatDate(comment.createdAt)}
									</span>
								</div>
								<p className="text-sm leading-relaxed whitespace-pre-wrap">
									{comment.text}
								</p>
								{isAuthenticated && depth < maxDepth && (
									<div className="flex items-center gap-2 mt-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setReplyingTo(comment.id)}
											className="h-7 px-2 text-xs"
										>
											<Reply className="mr-1 h-3 w-3" />
											Reply
										</Button>
									</div>
								)}
							</div>
						</div>

						{/* Reply Form */}
						{isReplying && (
							<div className="mt-4 ml-11">
								<Card>
									<CardContent className="p-3">
										<div className="space-y-3">
											<div className="flex gap-2">
												<Avatar className="h-6 w-6">
													<AvatarImage src={user?.avatarUrl || ""} />
													<AvatarFallback>
														{user?.fullName?.charAt(0).toUpperCase() || "U"}
													</AvatarFallback>
												</Avatar>
												<Textarea
													placeholder={`Reply to ${comment.user.name}...`}
													value={replyText}
													onChange={(e) => setReplyText(e.target.value)}
													maxLength={1000}
													rows={2}
													className="resize-none text-sm"
												/>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-xs text-muted-foreground">
													{replyText.length}/1000 characters
												</span>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={handleCancelReply}
														className="h-7 px-3 text-xs"
													>
														Cancel
													</Button>
													<Button
														onClick={() => handleSubmitReply(comment.id)}
														disabled={!replyText.trim() || isSubmitting}
														size="sm"
														className="h-7 px-3 text-xs"
													>
														{isSubmitting ? (
															<>
																<Loader2 className="mr-1 h-3 w-3 animate-spin" />
																Posting...
															</>
														) : (
															<>
																<Send className="mr-1 h-3 w-3" />
																Reply
															</>
														)}
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Render Replies */}
				{comment.replies && comment.replies.length > 0 && (
					<div className="mt-2">
						{comment.replies.map((reply) => renderComment(reply, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Comments Header */}
			<div className="flex items-center gap-2">
				<MessageCircle className="h-5 w-5" />
				<h3 className="text-lg font-semibold">
					Comments ({getTotalCommentsCount(comments)})
				</h3>
			</div>

			{/* Add Comment Form */}
			{isAuthenticated ? (
				<Card>
					<CardContent className="p-4">
						<div className="space-y-4">
							<div className="flex gap-3">
								<Avatar className="h-8 w-8">
									<AvatarImage src={user?.avatarUrl || ""} />
									<AvatarFallback>
										{user?.fullName?.charAt(0).toUpperCase() || "U"}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 space-y-2">
									<Textarea
										placeholder="Add a public comment..."
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
										onKeyDown={handleKeyPress}
										maxLength={1000}
										rows={3}
										className="resize-none"
									/>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											{newComment.length}/1000 characters
											{newComment.length > 0 && (
												<span className="ml-2">Press Ctrl+Enter to submit</span>
											)}
										</span>
										<Button
											onClick={handleSubmitComment}
											disabled={!newComment.trim() || isSubmitting}
											size="sm"
										>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Posting...
												</>
											) : (
												<>
													<Send className="mr-2 h-4 w-4" />
													Comment
												</>
											)}
										</Button>
									</div>
								</div>
							</div>
							{error && (
								<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
									{error}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-4 text-center">
						<p className="text-muted-foreground">
							Please{" "}
							<a href="/login" className="text-blue-600 hover:underline">
								log in
							</a>{" "}
							to add comments.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Comments List */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span className="ml-2">Loading comments...</span>
					</div>
				) : error && comments.length === 0 ? (
					<Card>
						<CardContent className="p-4 text-center">
							<p className="text-red-600">{error}</p>
						</CardContent>
					</Card>
				) : comments.length === 0 ? (
					<Card>
						<CardContent className="p-4 text-center">
							<MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
							<p className="text-muted-foreground">
								No comments yet. Be the first to comment!
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{comments.map((comment) => renderComment(comment, 0))}
					</div>
				)}
			</div>
		</div>
	);
}
