/**
 * Application Configuration
 *
 * Centralized configuration for API endpoints and environment-specific settings.
 * Update these values for different deployment environments.
 */

export const config = {
	// API Configuration
	api: {
		// Base URL for the backend API
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api",

		// Backend server URL (without /api suffix)
		serverUrl:
			process.env.NEXT_PUBLIC_SERVER_URL ||
			process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
			"http://localhost:3005",
	},

	// Upload Configuration
	uploads: {
		// Base path for uploaded files
		basePath: "/uploads",
	},

	// Environment
	env: {
		isDevelopment: process.env.NODE_ENV === "development",
		isProduction: process.env.NODE_ENV === "production",
	},
} as const;

/**
 * Get the full URL for a backend resource
 * @param path - The path to the resource (e.g., '/uploads/file.pdf')
 * @returns Full URL to the backend resource
 */
export function getBackendUrl(path: string): string {
	// If the path is already a full URL, return it as-is
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// Ensure path starts with /
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	return `${config.api.serverUrl}${normalizedPath}`;
}

/**
 * Get the full URL for an API endpoint
 * @param endpoint - The API endpoint path (e.g., '/papers')
 * @returns Full URL to the API endpoint
 */
export function getApiUrl(endpoint: string): string {
	// If the endpoint is already a full URL, return it as-is
	if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
		return endpoint;
	}

	// Ensure endpoint starts with /
	const normalizedEndpoint = endpoint.startsWith("/")
		? endpoint
		: `/${endpoint}`;

	return `${config.api.baseUrl}${normalizedEndpoint}`;
}

/**
 * Get the full URL for an uploaded file
 * @param filename - The filename (e.g., 'paper-123.pdf')
 * @returns Full URL to the uploaded file
 */
export function getUploadUrl(filename: string): string {
	return getBackendUrl(`${config.uploads.basePath}/${filename}`);
}
