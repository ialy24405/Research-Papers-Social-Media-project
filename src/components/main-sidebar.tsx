"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	BookCopy,
	FolderKanban,
	Home,
	LayoutGrid,
	Plus,
	Save,
	Settings,
	User,
	Upload,
	GraduationCap,
	LogIn,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { dummyUser } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "./ui/separator";

const menuItems = [
	{ href: "/home", label: "Home", icon: Home },
	{ href: "/papers", label: "All Papers", icon: GraduationCap },
	{ href: "/categories", label: "Categories", icon: BookCopy },
	{ href: "/upload", label: "Upload Paper", icon: Upload },
];

const profileMenuItems = [
	{ href: "/profile", label: "My Profile", icon: User },
	{ href: "/posts/status", label: "Post Status", icon: FolderKanban },
	{ href: "/profile/saved", label: "Saved Posts", icon: Save },
];

const adminMenuItems = [
	{ href: "/admin", label: "Admin Panel", icon: LayoutGrid },
];

export function MainSidebar() {
	const pathname = usePathname();
	const { user, isAuthenticated } = useAuth();
	const currentUser = user || dummyUser; // Fallback to dummyUser if not authenticated

	const isMenuItemActive = (href: string) => {
		if (href === "/home") return pathname === href;
		return pathname.startsWith(href);
	};

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2.5 p-2">
					<GraduationCap className="w-8 h-8 text-primary-foreground group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 transition-all" />
					<span className="text-lg font-bold font-headline tracking-tight text-primary-foreground group-data-[collapsible=icon]:hidden">
						ScholarStream
					</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					{menuItems.map((item) => (
						<SidebarMenuItem key={item.href}>
							<Link href={item.href} passHref>
								<SidebarMenuButton
									isActive={isMenuItemActive(item.href)}
									tooltip={{ children: item.label }}
								>
									<item.icon />
									<span>{item.label}</span>
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					))}
				</SidebarMenu>

				<SidebarMenu>
					<Separator className="my-2 bg-sidebar-border" />
					<p className="px-4 py-2 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
						Profile
					</p>
					{profileMenuItems.map((item) => (
						<SidebarMenuItem key={item.href}>
							<Link href={item.href} passHref>
								<SidebarMenuButton
									isActive={isMenuItemActive(item.href)}
									tooltip={{ children: item.label }}
								>
									<item.icon />
									<span>{item.label}</span>
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					))}
				</SidebarMenu>

				{(currentUser.role === "admin" || currentUser.role === "owner") && (
					<SidebarMenu>
						<Separator className="my-2 bg-sidebar-border" />
						<p className="px-4 py-2 text-xs text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
							{currentUser.role === "owner" ? "Owner" : "Admin"}
						</p>
						{adminMenuItems.map((item) => (
							<SidebarMenuItem key={item.href}>
								<Link href={item.href} passHref>
									<SidebarMenuButton
										isActive={isMenuItemActive(item.href)}
										tooltip={{ children: item.label }}
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</Link>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				)}
			</SidebarContent>
			<SidebarFooter>
				<Separator className="my-2 bg-sidebar-border" />
				<div className="p-2">
					{isAuthenticated ? (
						<SidebarMenuButton tooltip={{ children: "User Profile" }} asChild>
							<Link href="/profile">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={currentUser.avatarUrl || undefined}
										alt={currentUser.fullName}
									/>
									<AvatarFallback>
										{currentUser.fullName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
									<span className="font-medium">{currentUser.fullName}</span>
									<span className="text-xs text-muted-foreground">
										{currentUser.email}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					) : (
						<SidebarMenuButton tooltip={{ children: "Sign In" }} asChild>
							<Link href="/login">
								<LogIn className="h-8 w-8" />
								<div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
									<span className="font-medium">Sign In</span>
									<span className="text-xs text-muted-foreground">
										Access your account
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					)}
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
