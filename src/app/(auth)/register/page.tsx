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
import { Logo } from "@/components/icons";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ClientOnly } from "@/components/client-only";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		fullName: "",
		collegeName: "",
		country: "",
		ssn: "",
	});
	const [birthDate, setBirthDate] = useState<{
		month: string;
		day: string;
		year: string;
	}>({
		month: "",
		day: "",
		year: "",
	});
	const [error, setError] = useState("");
	const { register, isLoading } = useAuth();
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Convert birth date to ISO string
		const birthDateString = `${birthDate.year}-${birthDate.month.padStart(
			2,
			"0"
		)}-${birthDate.day.padStart(2, "0")}`;

		try {
			await register({
				...formData,
				birthDate: birthDateString,
			});
			router.push("/home");
		} catch (err: any) {
			setError(err.error || "Registration failed");
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
				<CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
				<CardDescription>Create your ScholarStream account</CardDescription>
			</CardHeader>
			<CardContent>
				<ClientOnly
					fallback={
						<div className="grid gap-4">
							<div className="text-sm text-muted-foreground bg-muted p-3 rounded">
								Loading registration form...
							</div>
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
							<Label htmlFor="fullName">Full name</Label>
							<Input
								id="fullName"
								name="fullName"
								placeholder="John Doe"
								value={formData.fullName}
								onChange={handleChange}
								disabled={isLoading}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="m@example.com"
								value={formData.email}
								onChange={handleChange}
								disabled={isLoading}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="********"
								value={formData.password}
								onChange={handleChange}
								disabled={isLoading}
								required
							/>
						</div>
						<EnhancedDatePicker
							value={birthDate}
							onChange={setBirthDate}
							label="Birth date"
							className="grid gap-2"
						/>
						<div className="grid gap-2">
							<Label htmlFor="collegeName">College name</Label>
							<Input
								id="collegeName"
								name="collegeName"
								placeholder="University of Knowledge"
								value={formData.collegeName}
								onChange={handleChange}
								disabled={isLoading}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									name="country"
									placeholder="USA"
									value={formData.country}
									onChange={handleChange}
									disabled={isLoading}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="ssn">SSN</Label>
								<Input
									id="ssn"
									name="ssn"
									placeholder="***-**-****"
									value={formData.ssn}
									onChange={handleChange}
									disabled={isLoading}
									required
								/>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								"Create an account"
							)}
						</Button>
					</form>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link href="/login" className="underline">
							Login
						</Link>
					</div>
				</ClientOnly>
			</CardContent>
		</Card>
	);
}
