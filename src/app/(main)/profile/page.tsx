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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUserPapers } from "@/hooks/use-user-papers";
import { useRouter } from "next/navigation";
import { dummyUser } from "@/lib/data";

export default function ProfilePage() {
	const { user: currentUser, logout, isLoading: authLoading } = useAuth();
	const { papers: userPapers, isLoading: papersLoading } = useUserPapers();
	const router = useRouter();

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

	if (authLoading || papersLoading) {
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
								Your recent activity on ScholarStream. This feature is coming
								soon!
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center text-muted-foreground py-12">
							<p>No recent activity to show.</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
