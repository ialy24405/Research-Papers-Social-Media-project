"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onClear: () => void;
}

export const AdminSearchInput = memo(function AdminSearchInput({
	value,
	onChange,
	onKeyPress,
	onClear,
}: AdminSearchInputProps) {
	return (
		<div className="relative flex-1">
			<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				placeholder="Search papers by title, author, or keyword... (Press Enter to search database)"
				className="w-full rounded-lg bg-card pl-8 pr-8 md:w-[300px] lg:w-[400px]"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyPress={onKeyPress}
			/>
			{value && (
				<button
					onClick={onClear}
					className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
});
