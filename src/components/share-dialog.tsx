"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Share2,
	Copy,
	Twitter,
	Facebook,
	Linkedin,
	Mail,
	Check,
} from "lucide-react";
import { shareViaPlatform, copyToClipboard } from "@/lib/share-utils";

interface ShareDialogProps {
	paper: {
		id: number;
		name: string;
		description?: string;
		authorName?: string;
	};
	children?: React.ReactNode;
}

export function ShareDialog({ paper, children }: ShareDialogProps) {
	const [copied, setCopied] = useState(false);
	const [open, setOpen] = useState(false);

	const paperUrl = `${
		typeof window !== "undefined" ? window.location.origin : ""
	}/papers/${paper.id}`;

	const handleCopy = async () => {
		const success = await copyToClipboard(paperUrl);
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handlePlatformShare = (
		platform: "twitter" | "facebook" | "linkedin" | "email"
	) => {
		shareViaPlatform(paper, platform);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="outline">
						<Share2 className="mr-2 h-4 w-4" />
						Share
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share Paper</DialogTitle>
					<DialogDescription>
						Share "{paper.name}" with others
					</DialogDescription>
				</DialogHeader>

				{/* Copy Link Section */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="paper-url">Paper Link</Label>
						<div className="flex gap-2">
							<Input
								id="paper-url"
								value={paperUrl}
								readOnly
								className="font-mono text-sm"
							/>
							<Button
								size="sm"
								variant="outline"
								onClick={handleCopy}
								className="shrink-0"
							>
								{copied ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						{copied && (
							<p className="text-sm text-green-600">
								Link copied to clipboard!
							</p>
						)}
					</div>

					<Separator />

					{/* Social Media Sharing */}
					<div className="space-y-3">
						<Label>Share on social media</Label>
						<div className="grid grid-cols-2 gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePlatformShare("twitter")}
								className="justify-start"
							>
								<Twitter className="mr-2 h-4 w-4 text-blue-500" />
								Twitter
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePlatformShare("facebook")}
								className="justify-start"
							>
								<Facebook className="mr-2 h-4 w-4 text-blue-600" />
								Facebook
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePlatformShare("linkedin")}
								className="justify-start"
							>
								<Linkedin className="mr-2 h-4 w-4 text-blue-700" />
								LinkedIn
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePlatformShare("email")}
								className="justify-start"
							>
								<Mail className="mr-2 h-4 w-4 text-gray-600" />
								Email
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
