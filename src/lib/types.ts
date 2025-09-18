export interface User {
	id: number;
	fullName: string;
	email: string;
	collegeName: string;
	country: string;
	birthDate: string;
	role: "user" | "admin" | "owner";
	avatarUrl: string | null;
	ssn: string;
	createdAt: string;
}

export interface Paper {
	id: number;
	title: string;
	name: string;
	description: string;
	author: User;
	authorId: number;
	authorName: string;
	authorAvatar: string | null;
	pdfUrl: string;
	category: Category;
	categoryId: string;
	categoryName: string;
	categoryDescription?: string;
	status: "approved" | "pending" | "rejected";
	rejectionReason?: string;
	approvedBy?: number;
	createdAt: string;
	updatedAt: string;
	reactionCount: number;
	commentCount: number;
	saveCount: number;
	interactions: interactions;
}
export interface interactions {
	comments: number;
	reactions: number;
	saves: number;
}
export interface Category {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	imageHint: string;
}

// API specific types
export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	fullName: string;
	email: string;
	password: string;
	birthDate: string;
	collegeName: string;
	country: string;
	ssn: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface PaperComment {
	id: number;
	userName: string;
	userAvatar: string | null;
	commentText: string;
	createdAt: string;
}

export interface PaperUploadData {
	title: string;
	description: string;
	categoryId: string;
	pdfFile: File;
}
