"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	FolderKanban,
	Save,
	Upload,
	User,
	Mail,
	University,
	Globe,
	Calendar,
	LogOut,
	Heart,
	MessageCircle,
	ThumbsUp,
	ThumbsDown,
	Laugh,
	Frown,
	Clock,
	Edit,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserPapers } from "@/hooks/use-user-papers";
import { useUserInteractions } from "@/hooks/use-user-interactions";
import { useProfileUpdate } from "@/hooks/use-profile-update";
import { useRouter } from "next/navigation";
import { dummyUser } from "@/lib/data";
import { useState } from "react";

export default function ProfilePage() {
	const { user: currentUser, logout, isLoading: authLoading } = useAuth();
	const { papers: userPapers, isLoading: papersLoading } = useUserPapers();
	const {
		interactions,
		isLoading: interactionsLoading,
		error: interactionsError,
	} = useUserInteractions();
	const { updateProfile, isUpdating, error: updateError } = useProfileUpdate();
	const router = useRouter();

	// Edit profile state
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({
		fullName: "",
		collegeName: "",
		country: "",
		avatarUrl: "",
	});

	// Use authenticated user or fallback to dummy user
	const user = currentUser || dummyUser;
	const formattedBirthDate = new Date(user.birthDate).toLocaleDateString();
	user.birthDate = formattedBirthDate;

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/login"); // Redirect to login page after logout
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const openEditDialog = () => {
		setEditFormData({
			fullName: user.fullName || "",
			collegeName: user.collegeName || "",
			country: user.country || "",
			avatarUrl: user.avatarUrl || "",
		});
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = await updateProfile(editFormData);

		if (result.success) {
			setIsEditDialogOpen(false);
			// Refresh the page to show updated data
			window.location.reload();
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setEditFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	if (authLoading || papersLoading || interactionsLoading) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="text-center">Loading...</div>
			</div>
		);
	}
	console.log("Current user:", currentUser);
	console.log("User papers:", userPapers);
	const pendingPapers = userPapers.filter((p) => p.status === "pending");
	console.log("Pending papers:", pendingPapers);
	const rejectedPapers = userPapers.filter((p) => p.status === "rejected");
	console.log("Rejected papers:", rejectedPapers);
	const stats = {
		submitted: userPapers.length,
		approved: userPapers.filter((p) => p.status === "approved").length,
		pending: userPapers.filter((p) => p.status === "pending").length,
		rejected: userPapers.filter((p) => p.status === "rejected").length,
	};
	// console.log("User stats:", stats);

	return (
		<div className="container mx-auto max-w-5xl py-8">
			{!currentUser && (
				<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
					<strong>Note:</strong> You are viewing dummy profile data. Please log
					in to see your real profile information.
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-1 space-y-8">
					<Card>
						<CardHeader className="items-center">
							<Avatar className="w-24 h-24 mb-4">
								<AvatarImage
									src={user.avatarUrl || undefined}
									alt={user.fullName}
								/>
								<AvatarFallback className="text-3xl">
									{user.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<CardTitle className="font-headline text-2xl">
								{user.fullName}
							</CardTitle>
							<CardDescription>
								{user.role === "owner"
									? "Owner"
									: user.role === "admin"
									? "Administrator"
									: "Researcher"}
							</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground space-y-3">
							<div className="flex items-center gap-3">
								<Mail className="w-4 h-4" />
								<span>{user.email}</span>
							</div>
							<div className="flex items-center gap-3">
								<University className="w-4 h-4" />
								<span>{user.collegeName}</span>
							</div>
							<div className="flex items-center gap-3">
								<Globe className="w-4 h-4" />
								<span>{user.country}</span>
							</div>
							<div className="flex items-center gap-3">
								<Calendar className="w-4 h-4" />
								<span>Born on {user.birthDate}</span>
							</div>
						</CardContent>
						{currentUser && (
							<div className="p-6 pt-0">
								<Button
									onClick={openEditDialog}
									variant="outline"
									className="w-full"
								>
									<Edit className="mr-2 h-4 w-4" />
									Edit Profile
								</Button>
							</div>
						)}
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="font-headline">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-2">
							<Button variant="outline" asChild className="justify-start">
								<Link href="/upload">
									<Upload className="mr-2 h-4 w-4" /> Upload New Paper
								</Link>
							</Button>
							<Button variant="outline" asChild className="justify-start">
								<Link href="/posts/status">
									<FolderKanban className="mr-2 h-4 w-4" /> View Post Status
								</Link>
							</Button>
							<Button variant="outline" asChild className="justify-start">
								<Link href="/profile/saved">
									<Save className="mr-2 h-4 w-4" /> View Saved Posts
								</Link>
							</Button>
							<Button
								variant="outline"
								className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
								onClick={handleLogout}
							>
								<LogOut className="mr-2 h-4 w-4" /> Logout
							</Button>
						</CardContent>
					</Card>
				</div>
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="font-headline">My Contributions</CardTitle>
							<CardDescription>
								An overview of your submitted papers.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-4 gap-4 text-center">
								<div>
									<p className="text-2xl font-bold">{stats.submitted}</p>
									<p className="text-sm text-muted-foreground">Submitted</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-green-600">
										{stats.approved}
									</p>
									<p className="text-sm text-muted-foreground">Approved</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-yellow-600">
										{stats.pending}
									</p>
									<p className="text-sm text-muted-foreground">Pending</p>
								</div>
								<div>
									<p className="text-2xl font-bold text-red-600">
										{stats.rejected}
									</p>
									<p className="text-sm text-muted-foreground">Rejected</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="font-headline">
								Recent Interactions
							</CardTitle>
							<CardDescription>
								Your recent activity on ScholarStream
							</CardDescription>
						</CardHeader>
						<CardContent>
							{interactionsError ? (
								<div className="text-center text-red-600 py-12">
									<p>Error loading interactions: {interactionsError}</p>
								</div>
							) : interactions.length === 0 ? (
								<div className="text-center text-muted-foreground py-12">
									<Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No recent activity to show.</p>
									<p className="text-sm mt-2">
										Start interacting with papers to see your activity here!
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{interactions.map((interaction) => {
										const getInteractionIcon = () => {
											switch (interaction.action) {
												case "like":
													return <ThumbsUp className="h-4 w-4 text-blue-600" />;
												case "love":
													return <Heart className="h-4 w-4 text-red-600" />;
												case "laugh":
													return <Laugh className="h-4 w-4 text-yellow-600" />;
												case "dislike":
													return (
														<ThumbsDown className="h-4 w-4 text-gray-600" />
													);
												case "sad":
													return <Frown className="h-4 w-4 text-blue-600" />;
												case "commented":
													return (
														<MessageCircle className="h-4 w-4 text-green-600" />
													);
												case "saved":
													return <Save className="h-4 w-4 text-purple-600" />;
												default:
													return <Clock className="h-4 w-4 text-gray-600" />;
											}
										};

										const getActionText = () => {
											switch (interaction.action) {
												case "like":
													return "liked";
												case "love":
													return "loved";
												case "laugh":
													return "found funny";
												case "dislike":
													return "disliked";
												case "sad":
													return "found sad";
												case "commented":
													return "commented on";
												case "saved":
													return "saved";
												default:
													return interaction.action;
											}
										};

										return (
											<div
												key={interaction.id}
												className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
											>
												<div className="flex-shrink-0 mt-1">
													{getInteractionIcon()}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm">
														You{" "}
														<span className="font-medium">
															{getActionText()}
														</span>{" "}
														<Link
															href={`/papers/${interaction.paper.id}`}
															className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
														>
															{interaction.paper.title}
														</Link>
													</p>
													<div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
														<span>by {interaction.paper.author.name}</span>
														<span>•</span>
														<span>{interaction.paper.category}</span>
														<span>•</span>
														<span>
															{new Date(
																interaction.createdAt
															).toLocaleDateString()}{" "}
															at{" "}
															{new Date(
																interaction.createdAt
															).toLocaleTimeString([], {
																hour: "2-digit",
																minute: "2-digit",
															})}
														</span>
													</div>
												</div>
											</div>
										);
									})}
									{interactions.length >= 20 && (
										<div className="text-center pt-4">
											<Button variant="outline" size="sm">
												Load More
											</Button>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Edit Profile Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>
							Update your profile information. Changes will be saved
							immediately.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								type="text"
								value={editFormData.fullName}
								onChange={(e) => handleInputChange("fullName", e.target.value)}
								placeholder="Enter your full name"
								required
								minLength={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="collegeName">College Name</Label>
							<Input
								id="collegeName"
								type="text"
								value={editFormData.collegeName}
								onChange={(e) =>
									handleInputChange("collegeName", e.target.value)
								}
								placeholder="Enter your college name"
								required
								minLength={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="country">Country</Label>
							<Input
								id="country"
								type="text"
								value={editFormData.country}
								onChange={(e) => handleInputChange("country", e.target.value)}
								placeholder="Enter your country"
								required
								minLength={2}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
							<Input
								id="avatarUrl"
								type="url"
								value={editFormData.avatarUrl}
								onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
								placeholder="Enter avatar image URL"
							/>
						</div>

						{updateError && (
							<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
								{updateError}
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
								disabled={isUpdating}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isUpdating}>
								{isUpdating ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
