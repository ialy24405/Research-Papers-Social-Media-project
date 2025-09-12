"use client";

import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
	value?: { month: string; day: string; year: string };
	onChange?: (date: { month: string; day: string; year: string }) => void;
	label?: string;
	placeholder?: string;
	className?: string;
}

export function EnhancedDatePicker({
	value = { month: "", day: "", year: "" },
	onChange,
	label = "Birth date",
	className,
}: DatePickerProps) {
	const [birthMonth, setBirthMonth] = React.useState(value.month);
	const [birthDay, setBirthDay] = React.useState(value.day);
	const [birthYear, setBirthYear] = React.useState(value.year);

	// Generate years from 1924 to current year (most recent first)
	const currentYear = new Date().getFullYear();
	const years = Array.from(
		{ length: currentYear - 1924 + 1 },
		(_, i) => currentYear - i
	);

	// Common birth years for students/young adults (18-35 years old)
	const commonYears = Array.from(
		{ length: 18 },
		(_, i) => currentYear - 18 - i
	);

	// Months
	const months = [
		{ value: "01", label: "January" },
		{ value: "02", label: "February" },
		{ value: "03", label: "March" },
		{ value: "04", label: "April" },
		{ value: "05", label: "May" },
		{ value: "06", label: "June" },
		{ value: "07", label: "July" },
		{ value: "08", label: "August" },
		{ value: "09", label: "September" },
		{ value: "10", label: "October" },
		{ value: "11", label: "November" },
		{ value: "12", label: "December" },
	];

	// Generate days based on selected month and year
	const getDaysInMonth = (month: string, year: string) => {
		if (!month || !year) return 31;
		const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
		return daysInMonth;
	};

	const days = Array.from(
		{ length: getDaysInMonth(birthMonth, birthYear) },
		(_, i) => i + 1
	);

	// Handle changes and notify parent
	const handleMonthChange = (month: string) => {
		setBirthMonth(month);
		onChange?.({ month, day: birthDay, year: birthYear });
	};

	const handleDayChange = (day: string) => {
		setBirthDay(day);
		onChange?.({ month: birthMonth, day, year: birthYear });
	};

	const handleYearChange = (year: string) => {
		setBirthYear(year);
		onChange?.({ month: birthMonth, day: birthDay, year });

		// Adjust day if the selected day doesn't exist in the new month/year
		const maxDays = getDaysInMonth(birthMonth, year);
		if (parseInt(birthDay) > maxDays) {
			const newDay = maxDays.toString().padStart(2, "0");
			setBirthDay(newDay);
			onChange?.({ month: birthMonth, day: newDay, year });
		}
	};

	// Calculate age for display
	const getAge = () => {
		if (!birthMonth || !birthDay || !birthYear) return null;
		const birthDate = new Date(
			parseInt(birthYear),
			parseInt(birthMonth) - 1,
			parseInt(birthDay)
		);
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}
		return age;
	};

	const age = getAge();

	return (
		<div className={className}>
			<Label htmlFor="birth-date">{label}</Label>
			<div className="grid grid-cols-3 gap-2 mt-2">
				<div>
					<Label
						htmlFor="birth-month"
						className="text-xs text-muted-foreground"
					>
						Month
					</Label>
					<Select value={birthMonth} onValueChange={handleMonthChange}>
						<SelectTrigger>
							<SelectValue placeholder="Month" />
						</SelectTrigger>
						<SelectContent>
							{months.map((month) => (
								<SelectItem key={month.value} value={month.value}>
									{month.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="birth-day" className="text-xs text-muted-foreground">
						Day
					</Label>
					<Select value={birthDay} onValueChange={handleDayChange}>
						<SelectTrigger>
							<SelectValue placeholder="Day" />
						</SelectTrigger>
						<SelectContent className="max-h-[200px]">
							{days.map((day) => (
								<SelectItem key={day} value={day.toString().padStart(2, "0")}>
									{day}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="birth-year" className="text-xs text-muted-foreground">
						Year
					</Label>
					<Select value={birthYear} onValueChange={handleYearChange}>
						<SelectTrigger>
							<SelectValue placeholder="Year" />
						</SelectTrigger>
						<SelectContent className="max-h-[250px]">
							{/* Quick selection for common student ages */}
							<div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-sm mx-1 mb-1">
								👨‍🎓 Student Ages (18-35)
							</div>
							{commonYears.map((year) => (
								<SelectItem
									key={`common-${year}`}
									value={year.toString()}
									className="font-medium"
								>
									<div className="flex justify-between items-center w-full">
										<span>{year}</span>
										<span className="text-xs text-muted-foreground ml-2">
											{currentYear - year} years old
										</span>
									</div>
								</SelectItem>
							))}

							{/* Separator */}
							<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mx-1 mt-2 mb-1">
								📅 All Years
							</div>

							{/* All years */}
							{years.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Display selected date and age */}
			{birthMonth && birthDay && birthYear && (
				<div className="mt-2 p-2 bg-muted/50 rounded-md">
					<p className="text-sm text-foreground">
						<span className="font-medium">Selected:</span>{" "}
						{months.find((m) => m.value === birthMonth)?.label}{" "}
						{parseInt(birthDay)}, {birthYear}
					</p>
					{age !== null && (
						<p className="text-xs text-muted-foreground mt-1">
							Age: {age} years old
						</p>
					)}
				</div>
			)}
		</div>
	);
}
