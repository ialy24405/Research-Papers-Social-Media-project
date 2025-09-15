"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If user is authenticated, redirect to main app
		if (!isLoading && isAuthenticated) {
			router.push("/home");
		}
	}, [isAuthenticated, isLoading, router]);

	// Show loading while checking authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// If authenticated, don't show landing page (will redirect)
	if (isAuthenticated) {
		return null;
	}

	// Show landing page for unauthenticated users
	return (
		<div className="flex flex-col min-h-screen">
			<header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2">
					<GraduationCap className="h-8 w-8 text-primary" />
					<span className="text-xl font-bold font-headline tracking-tighter text-foreground">
						ScholarStream
					</span>
				</Link>
				<nav className="flex items-center gap-4">
					<Button asChild>
						<Link href="/login">Login</Link>
					</Button>
					<Button asChild>
						<Link href="/register">Sign Up</Link>
					</Button>
				</nav>
			</header>
			<main className="flex-1">
				<section className="relative w-full py-20 md:py-32 lg:py-40">
					<div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 -z-10"></div>
					<div
						className="absolute inset-0 -z-20 opacity-20"
						style={{
							backgroundImage:
								"radial-gradient(circle at 25% 30%, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at 75% 70%, hsl(var(--accent) / 0.1), transparent 40%)",
						}}
					></div>
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tighter text-foreground">
							Dive into the Stream of Knowledge
						</h1>
						<p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
							ScholarStream is a modern social platform for students and
							researchers to discover, discuss, and share academic papers.
						</p>
						<div className="mt-8 flex justify-center gap-4">
							<Button asChild>
								<Link href="/register">Get Started for Free</Link>
							</Button>
							<Button asChild>
								<Link href="/login">Sign In</Link>
							</Button>
						</div>
					</div>
				</section>
			</main>
			<footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
				<p>
					&copy; {new Date().getFullYear()} ScholarStream. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
