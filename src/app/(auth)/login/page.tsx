"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { ClientOnly } from "@/components/client-only";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login, isLoading } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			await login({ email, password });
			router.push("/home");
		} catch (err: any) {
			setError(err.error || "Login failed");
		}
	};

	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<Link href="/" className="flex items-center justify-center gap-2 mb-4">
					<Logo className="h-8 w-8 text-primary" />
					<span className="text-2xl font-bold font-headline tracking-tighter text-foreground">
						ScholarStream
					</span>
				</Link>
				<CardTitle className="text-2xl font-headline">Login</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ClientOnly
					fallback={
						<div className="grid gap-4">
							<div className="text-sm text-muted-foreground bg-muted p-3 rounded">
								Loading login form...
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									disabled
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<Link
										href="#"
										className="ml-auto inline-block text-sm underline"
									>
										Forgot your password?
									</Link>
								</div>
								<Input id="password" type="password" disabled />
							</div>
							<Button type="button" className="w-full" disabled>
								Loading...
							</Button>
						</div>
					}
				>
					<form onSubmit={handleSubmit} className="grid gap-4">
						{error && (
							<div className="text-sm text-red-600 bg-red-50 p-3 rounded">
								{error}
							</div>
						)}
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
								<Link
									href="#"
									className="ml-auto inline-block text-sm underline"
								>
									Forgot your password?
								</Link>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Logging in...
								</>
							) : (
								"Login"
							)}
						</Button>
					</form>
				</ClientOnly>
				<div className="mt-4 text-center text-sm">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="underline">
						Sign up
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
