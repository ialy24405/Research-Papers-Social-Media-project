"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
	children: React.ReactNode;
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Don't redirect if still loading
		if (isLoading) return;

		// Check if current route is public
		const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

		// If user is not authenticated and trying to access a protected route
		if (!isAuthenticated && !isPublicRoute) {
			console.log("User not authenticated, redirecting to login");
			router.push("/login");
			return;
		}

		// If user is authenticated and trying to access auth pages, redirect to home
		if (isAuthenticated && isPublicRoute) {
			console.log("User already authenticated, redirecting to home");
			router.push("/home");
			return;
		}
	}, [isAuthenticated, isLoading, pathname, router]);

	// Show loading spinner while checking authentication
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

	// Show nothing while redirecting
	const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
	if (!isAuthenticated && !isPublicRoute) {
		return null; // Will redirect to login
	}

	if (isAuthenticated && isPublicRoute) {
		return null; // Will redirect to home
	}

	// Render children if authenticated or on public route
	return <>{children}</>;
}
