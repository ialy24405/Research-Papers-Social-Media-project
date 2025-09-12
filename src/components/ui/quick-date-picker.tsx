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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search } from "lucide-react";

interface QuickDatePickerProps {
	value?: { month: string; day: string; year: string };
	onChange?: (date: { month: string; day: string; year: string }) => void;
	label?: string;
	className?: string;
}

export function QuickDatePicker({
	value = { month: "", day: "", year: "" },
	onChange,
	label = "Birth date",
	className,
}: QuickDatePickerProps) {
	const [birthMonth, setBirthMonth] = React.useState(value.month);
	const [birthDay, setBirthDay] = React.useState(value.day);
	const [birthYear, setBirthYear] = React.useState(value.year);
	const [yearSearch, setYearSearch] = React.useState("");
	const [showQuickOptions, setShowQuickOptions] = React.useState(true);

	const currentYear = new Date().getFullYear();

	// Quick year options for common ages
	const quickYears = [
		{ year: currentYear - 18, label: "18 years old" },
		{ year: currentYear - 20, label: "20 years old" },
		{ year: currentYear - 22, label: "22 years old" },
		{ year: currentYear - 25, label: "25 years old" },
		{ year: currentYear - 30, label: "30 years old" },
	];

	// All years
	const allYears = Array.from(
		{ length: currentYear - 1924 + 1 },
		(_, i) => currentYear - i
	);

	// Filter years based on search
	const filteredYears = yearSearch
		? allYears.filter((year) => year.toString().includes(yearSearch))
		: allYears;

	const months = [
		{ value: "01", label: "January", short: "Jan" },
		{ value: "02", label: "February", short: "Feb" },
		{ value: "03", label: "March", short: "Mar" },
		{ value: "04", label: "April", short: "Apr" },
		{ value: "05", label: "May", short: "May" },
		{ value: "06", label: "June", short: "Jun" },
		{ value: "07", label: "July", short: "Jul" },
		{ value: "08", label: "August", short: "Aug" },
		{ value: "09", label: "September", short: "Sep" },
		{ value: "10", label: "October", short: "Oct" },
		{ value: "11", label: "November", short: "Nov" },
		{ value: "12", label: "December", short: "Dec" },
	];

	const getDaysInMonth = (month: string, year: string) => {
		if (!month || !year) return 31;
		return new Date(parseInt(year), parseInt(month), 0).getDate();
	};

	const days = Array.from(
		{ length: getDaysInMonth(birthMonth, birthYear) },
		(_, i) => i + 1
	);

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

		// Adjust day if needed
		const maxDays = getDaysInMonth(birthMonth, year);
		if (parseInt(birthDay) > maxDays) {
			const newDay = maxDays.toString().padStart(2, "0");
			setBirthDay(newDay);
			onChange?.({ month: birthMonth, day: newDay, year });
		}
	};

	const handleQuickYearSelect = (year: number) => {
		const yearStr = year.toString();
		setBirthYear(yearStr);
		onChange?.({ month: birthMonth, day: birthDay, year: yearStr });
	};

	const getFormattedDate = () => {
		if (!birthMonth || !birthDay || !birthYear) return null;
		const monthName = months.find((m) => m.value === birthMonth)?.short;
		return `${monthName} ${parseInt(birthDay)}, ${birthYear}`;
	};

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

	return (
		<div className={className}>
			<Label htmlFor="birth-date" className="flex items-center gap-2">
				<Calendar className="w-4 h-4" />
				{label}
			</Label>

			{/* Quick year selection */}
			<div className="mt-2">
				<div className="flex flex-wrap gap-2 mb-3">
					{quickYears.map(({ year, label }) => (
						<Button
							key={year}
							type="button"
							variant={birthYear === year.toString() ? "default" : "outline"}
							size="sm"
							onClick={() => handleQuickYearSelect(year)}
							className="text-xs"
						>
							{label}
						</Button>
					))}
				</div>
			</div>

			{/* Date selectors */}
			<div className="grid grid-cols-3 gap-2">
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
						<SelectContent className="max-h-[200px]">
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
						<SelectContent className="max-h-[300px]">
							{/* Search input */}
							<div className="p-2 border-b">
								<div className="relative">
									<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										placeholder="Search year..."
										value={yearSearch}
										onChange={(e) => setYearSearch(e.target.value)}
										className="pl-8 h-8"
									/>
								</div>
							</div>

							{!yearSearch && (
								<>
									<div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/10">
										🎓 Common Student Ages
									</div>
									{quickYears.map(({ year, label }) => (
										<SelectItem
											key={`quick-${year}`}
											value={year.toString()}
											className="font-medium"
										>
											<div className="flex justify-between items-center w-full">
												<span>{year}</span>
												<span className="text-xs text-muted-foreground ml-2">
													{label}
												</span>
											</div>
										</SelectItem>
									))}
									<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
										📅 All Years
									</div>
								</>
							)}

							{filteredYears.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Display result */}
			{getFormattedDate() && (
				<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-green-800">
								📅 {getFormattedDate()}
							</p>
							{getAge() !== null && (
								<p className="text-xs text-green-600 mt-1">
									🎂 {getAge()} years old
								</p>
							)}
						</div>
						<div className="text-green-500">✅</div>
					</div>
				</div>
			)}
		</div>
	);
}
