"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../lib/api";
import type { User, LoginCredentials, RegisterData } from "../lib/types";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (credentials: LoginCredentials) => Promise<any>;
	register: (data: RegisterData) => Promise<any>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const initAuth = async () => {
			const token = authService.getToken();
			if (token) {
				try {
					// Fetch user data if token exists
					const userData = await userService.getProfile();
					console.log("Auth context initialized with user:", userData);
					setUser(userData);
					setIsAuthenticated(true);
				} catch (error) {
					// Token might be expired or invalid
					console.error("Failed to fetch user profile:", error);
					authService.clearToken();
					setIsAuthenticated(false);
					setUser(null);
				}
			} else {
				setIsAuthenticated(false);
			}
			setIsLoading(false);
		};

		initAuth();
	}, []);

	const login = async (credentials: LoginCredentials) => {
		try {
			setIsLoading(true);
			const response = await authService.login(credentials);
			setUser(response.user);
			setIsAuthenticated(true);
			return response;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (data: RegisterData) => {
		try {
			setIsLoading(true);
			const response = await authService.register(data);
			setUser(response.user);
			setIsAuthenticated(true);
			return response;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
		} finally {
			setUser(null);
			setIsAuthenticated(false);
		}
	};

	const value = {
		user,
		isLoading,
		isAuthenticated,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
