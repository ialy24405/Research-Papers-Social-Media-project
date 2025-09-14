"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { usePapers } from "@/hooks/use-papers";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function UploadPage() {
	const [file, setFile] = useState<File | null>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { toast } = useToast();
	const router = useRouter();
	const { categories } = useCategories();
	const { uploadPaper } = usePapers();
	const { isAuthenticated } = useAuth();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const selectedFile = event.target.files[0];
			console.log("File selected:", {
				name: selectedFile.name,
				size: selectedFile.size,
				type: selectedFile.type,
				lastModified: selectedFile.lastModified,
				isFile: selectedFile instanceof File,
			});
			setFile(selectedFile);
		} else {
			console.log("No file selected or files array is empty");
			setFile(null);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!isAuthenticated) {
			toast({
				title: "Authentication required",
				description: "Please log in to upload papers.",
				variant: "destructive",
			});
			router.push("/login");
			return;
		}

		if (!file) {
			console.log("No file selected in validation");
			toast({
				title: "No file selected",
				description: "Please select a PDF file to upload.",
				variant: "destructive",
			});
			return;
		}

		if (!(file instanceof File)) {
			console.log("file is not a File instance:", typeof file, file);
			toast({
				title: "Invalid file",
				description: "Please select a valid PDF file.",
				variant: "destructive",
			});
			return;
		}

		if (!title || !categoryId) {
			toast({
				title: "Missing information",
				description: "Please fill in all required fields (title and category).",
				variant: "destructive",
			});
			return;
		}

		console.log("Form submission data:", {
			title,
			description,
			categoryId,
			file,
			fileSize: file?.size,
			fileName: file?.name,
			fileType: file?.type,
		});

		setIsSubmitting(true);

		try {
			await uploadPaper({
				title,
				description,
				categoryId: categoryId,
				pdfFile: file,
			});

			toast({
				title: "Submission Successful",
				description: "Your paper has been submitted for review.",
			});

			// Simulate redirect after successful submission
			setTimeout(() => {
				router.push("/posts/status");
			}, 1500);
		} catch (error) {
			console.error("Submission failed:", error);
			console.error("Error details:", JSON.stringify(error, null, 2));

			const errorMessage =
				error instanceof Error
					? error.message
					: typeof error === "object" && error && "error" in error
					? String(error.error)
					: "There was an error processing your paper. Please try again.";

			toast({
				title: "Submission Failed",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto max-w-3xl py-8">
			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle className="font-headline text-2xl">
							Submit a New Paper
						</CardTitle>
						<CardDescription>
							Upload your research paper for review and publication on
							ScholarStream.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="title">Paper Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g., The Future of Artificial Intelligence"
								disabled={isSubmitting}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">
								Description / Abstract (Optional)
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Provide a brief summary or abstract of your paper (optional)."
								disabled={isSubmitting}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								value={categoryId}
								onValueChange={setCategoryId}
								disabled={isSubmitting}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="pdf-file">PDF Document</Label>
							<div className="flex items-center justify-center w-full">
								<label
									htmlFor="pdf-file"
									className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
										<p className="mb-2 text-sm text-muted-foreground">
											<span className="font-semibold">Click to upload</span> or
											drag and drop
										</p>
										<p className="text-xs text-muted-foreground">
											PDF only (MAX. 10MB)
										</p>
									</div>
									<Input
										id="pdf-file"
										type="file"
										className="hidden"
										accept=".pdf"
										onChange={handleFileChange}
									/>
								</label>
							</div>
							{file && (
								<div className="mt-2">
									<p className="text-sm text-muted-foreground">
										Selected file: {file.name}
									</p>
									<p className="text-xs text-muted-foreground">
										Size: {(file.size / 1024 / 1024).toFixed(2)} MB
									</p>
									{/* <Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											console.log("File test - Current file state:", {
												file,
												name: file?.name,
												size: file?.size,
												type: file?.type,
												isFile: file instanceof File,
											});
										}}
									>
										Test File (Check Console)
									</Button> */}
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" disabled={isSubmitting} className="ml-auto">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								"Submit for Review"
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
