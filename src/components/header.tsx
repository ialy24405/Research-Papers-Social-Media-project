"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { dummyUser } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";

function pathToBreadcrumb(path: string) {
	const pathnames = path.split("/").filter((x) => x);

	const breadcrumbs = pathnames.map((name, index) => {
		const href = "/" + pathnames.slice(0, index + 1).join("/");
		const label =
			name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");
		return { label, href };
	});

	if (pathnames[0] === "home") {
		return breadcrumbs.map((b) =>
			b.href === "/home" ? { ...b, label: "Home" } : b
		);
	}

	return [{ label: "Home", href: "/home" }, ...breadcrumbs];
}

export function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const breadcrumbs = pathToBreadcrumb(pathname);
	const { user, isAuthenticated, logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};
	const currentUser = user || dummyUser; // Fallback to dummyUser if not authenticated

	return (
		<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
			<SidebarTrigger className="md:hidden" />
			<Breadcrumb className="hidden md:flex">
				<BreadcrumbList>
					{breadcrumbs.map((crumb, index) => (
						<BreadcrumbItem key={crumb.href}>
							{index < breadcrumbs.length - 1 ? (
								<>
									<BreadcrumbLink asChild>
										<Link href={crumb.href}>{crumb.label}</Link>
									</BreadcrumbLink>
									<BreadcrumbSeparator />
								</>
							) : (
								<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					))}
				</BreadcrumbList>
			</Breadcrumb>
			<div className="relative ml-auto flex-1 md:grow-0">
				{/* Search could go here */}
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="overflow-hidden rounded-full"
					>
						<Avatar className="h-8 w-8">
              {currentUser.avatarUrl ? (
                <AvatarImage
                  src={currentUser.avatarUrl || undefined}
                  alt={currentUser.fullName}
                />
              ) : (
                <AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback>
              )}
							{/* <AvatarImage
								src={currentUser.avatarUrl || undefined}
								alt={currentUser.fullName}
							/>
							<AvatarFallback>{currentUser.fullName.charAt(0)}</AvatarFallback> */}
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{currentUser.fullName}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{currentUser.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/profile">
							<User className="mr-2" />
							<span>Profile</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout}>
						<LogOut className="mr-2" />
						<span>Logout</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
