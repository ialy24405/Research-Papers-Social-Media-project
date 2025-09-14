// API Configuration
export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api",
	TIMEOUT: 10000,
} as const;

// API endpoints
export const API_ENDPOINTS = {
	// Auth endpoints
	AUTH: {
		REGISTER: "/auth/register",
		LOGIN: "/auth/login",
		REFRESH: "/auth/refresh",
		LOGOUT: "/auth/logout",
	},

	// Categories endpoints
	CATEGORIES: {
		LIST: "/categories",
		GET: (id: string) => `/categories/${id}`,
	},

	// Papers endpoints
	PAPERS: {
		LIST: "/papers",
		GET: (id: string) => `/papers/${id}`,
		UPLOAD: "/papers/upload",
		UPDATE_STATUS: (id: string) => `/papers/${id}/status`,
		REACT: (id: string) => `/papers/${id}/react`,
		COMMENT: (id: string) => `/papers/${id}/comment`,
		SAVE: (id: string) => `/papers/${id}/save`,
	},

	// Users endpoints
	USERS: {
		PROFILE: "/users/me",
		UPDATE_PROFILE: "/users/me",
		MY_PAPERS: "/users/me/papers",
		SAVED_PAPERS: "/users/me/saved-papers",
	},

	// Admin endpoints
	ADMIN: {
		USERS: "/admin/users",
		PAPERS: "/admin/papers",
		UPDATE_USER_ROLE: (id: string) => `/admin/users/${id}/role`,
		MODERATE_PAPER: (id: string) => `/admin/papers/${id}/moderate`,
	},
} as const;
