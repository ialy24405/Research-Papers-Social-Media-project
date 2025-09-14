import { httpClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { LoginCredentials, RegisterData, AuthResponse } from "../types";

export const authService = {
	/**
	 * Register a new user
	 */
	async register(data: RegisterData): Promise<AuthResponse> {
		const response = await httpClient.post<AuthResponse>(
			API_ENDPOINTS.AUTH.REGISTER,
			data
		);

		// Store token in localStorage
		if (response.token) {
			localStorage.setItem("auth_token", response.token);
		}

		return response;
	},

	/**
	 * Login user
	 */
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await httpClient.post<AuthResponse>(
			API_ENDPOINTS.AUTH.LOGIN,
			credentials
		);

		// Store token in localStorage
		if (response.token) {
			localStorage.setItem("auth_token", response.token);
		}
		console.log("Login response:");
		console.log(response);

		return response;
	},

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		try {
			// For JWT tokens, we can handle logout client-side
			// But still make the API call if the endpoint exists
			await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
		} catch (error) {
			// If the logout endpoint fails, we still proceed with local logout
			console.log("Logout API call failed (this is okay for JWT):", error);
		} finally {
			// Always clear local storage
			localStorage.removeItem("auth_token");
		}
	},

	/**
	 * Get stored auth token
	 */
	getToken(): string | null {
		return typeof window !== "undefined"
			? localStorage.getItem("auth_token")
			: null;
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return !!this.getToken();
	},

	/**
	 * Clear auth token
	 */
	clearToken(): void {
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}
	},
};
