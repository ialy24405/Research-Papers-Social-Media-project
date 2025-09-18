/**
 * Applicati			: process.env.NEXT_PUBLIC_API_URL || "/api",

		// Backend server URL (without /api suffix)
		serverUrl:
			process.env.NEXT_PUBLIC_SERVER_URL ||
			process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
			"http://localhost:3000",iguration
 *
 * Centralized configuration for API endpoints and environment-specific settings.
 * Update these values for different deployment environments.
 */

export const config = (() => {
	// Determine a sensible default origin depending on runtime (browser vs server)
	const browserOrigin =
		typeof window !== "undefined" ? window.location.origin : undefined;

	// serverDefault is used during SSR or when env vars are missing. Don't forcibly assume localhost
	const serverDefault =
		process.env.NEXT_PUBLIC_SERVER_URL ||
		process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") 
		// ||
		// "http://localhost:3000";

	const origin = browserOrigin || serverDefault;

	// Resolve base API URL. If NEXT_PUBLIC_API_URL is set and is relative, use the runtime origin.
	const rawApi = process.env.NEXT_PUBLIC_API_URL;
	const baseUrl = rawApi
		? rawApi.startsWith("http")
			? rawApi
			: `${origin}${rawApi.startsWith("/") ? rawApi : `/${rawApi}`}`
		: `${origin}/api`;

	const serverUrl =
		process.env.NEXT_PUBLIC_SERVER_URL ||
		(rawApi && rawApi.startsWith("http")
			? rawApi.replace(/\/api\/?$/, "")
			: origin);

	return {
		api: {
			baseUrl,
			serverUrl,
		},
		uploads: {
			basePath: "/uploads",
		},
		env: {
			isDevelopment: process.env.NODE_ENV === "development",
			isProduction: process.env.NODE_ENV === "production",
		},
	} as const;
})();

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

	// Use window.location.origin in browser, fallback to serverUrl for SSR or environment
	const origin =
		typeof window !== "undefined"
			? window.location.origin
			: config.api.serverUrl;
	return `${origin}${normalizedPath}`;
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
