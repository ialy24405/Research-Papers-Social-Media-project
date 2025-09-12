"use client";

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
import { Logo } from "@/components/icons";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import React from "react";

export default function RegisterPage() {
	const [birthDate, setBirthDate] = React.useState<{
		month: string;
		day: string;
		year: string;
	}>({
		month: "",
		day: "",
		year: "",
	});

	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<Link href="/" className="flex items-center justify-center gap-2 mb-4">
					<Logo className="h-8 w-8 text-primary" />
					<span className="text-2xl font-bold font-headline tracking-tighter text-foreground">
						ScholarStream
					</span>
				</Link>
				<CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
				<CardDescription>Create your ScholarStream account</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="full-name">Full name</Label>
						<Input id="full-name" placeholder="John Doe" required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" type="password" placeholder="********" />
					</div>
					<EnhancedDatePicker
						value={birthDate}
						onChange={setBirthDate}
						label="Birth date"
						className="grid gap-2"
					/>
					<div className="grid gap-2">
						<Label htmlFor="college-name">College name</Label>
						<Input
							id="college-name"
							placeholder="University of Knowledge"
							required
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="country">Country</Label>
							<Input id="country" placeholder="USA" required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="ssn">SSN</Label>
							<Input id="ssn" placeholder="***-**-****" required />
						</div>
					</div>
					<Button type="submit" className="w-full" asChild>
						<Link href="/home">Create an account</Link>
					</Button>
				</div>
				<div className="mt-4 text-center text-sm">
					Already have an account?{" "}
					<Link href="/login" className="underline">
						Login
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
