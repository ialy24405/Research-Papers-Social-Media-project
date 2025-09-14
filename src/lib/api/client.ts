import { API_CONFIG } from "./config";

// Types for HTTP responses
export interface ApiResponse<T = any> {
	data?: T;
	error?: string;
	message?: string;
}

export interface ApiError {
	error: string;
	message?: string;
	statusCode?: number;
}

// HTTP Client class
class HttpClient {
	private baseURL: string;
	private timeout: number;

	constructor() {
		this.baseURL = API_CONFIG.BASE_URL;
		this.timeout = API_CONFIG.TIMEOUT;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		// Get auth token from localStorage if available
		const token =
			typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

		const defaultHeaders: HeadersInit = {};

		// Only set Content-Type for non-FormData requests
		if (!(options.body instanceof FormData)) {
			defaultHeaders["Content-Type"] = "application/json";
		}

		if (token) {
			defaultHeaders.Authorization = `Bearer ${token}`;
		}

		const config: RequestInit = {
			...options,
			headers: {
				...defaultHeaders,
				...options.headers,
			},
			signal: AbortSignal.timeout(this.timeout),
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw {
					error: errorData.error || "Request failed",
					message: errorData.message || response.statusText,
					statusCode: response.status,
				} as ApiError;
			}

			// Handle empty responses
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return await response.json();
			} else {
				return {} as T;
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw { error: "Request timeout", statusCode: 408 } as ApiError;
				}
				if (error.name === "TypeError") {
					throw { error: "Network error", statusCode: 0 } as ApiError;
				}
			}
			throw error;
		}
	}

	async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		let url = endpoint;
		if (params) {
			const searchParams = new URLSearchParams(params);
			url += `?${searchParams.toString()}`;
		}
		return this.request<T>(url, { method: "GET" });
	}

	async post<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async put<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(endpoint: string, data?: any): Promise<T> {
		return this.request<T>(endpoint, {
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE" });
	}

	async upload<T>(endpoint: string, formData: FormData): Promise<T> {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return this.request<T>(endpoint, {
			method: "POST",
			body: formData,
			headers,
		});
	}
}

export const httpClient = new HttpClient();
