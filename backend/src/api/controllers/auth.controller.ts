import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel, CreateUserData } from "../models/user.model";
import { registerSchema, loginSchema } from "../utils/validation";
import { config } from "../../config";

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			// Validate request body
			const { error, value } = registerSchema.validate(req.body);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			const {
				fullName,
				email,
				password,
				birthDate,
				collegeName,
				country,
				ssn,
			} = value;

			// Check if user already exists
			const existingUser = await UserModel.findByEmail(email);
			if (existingUser) {
				return res.status(409).json({ error: "Email already exists" });
			}

			// Hash password
			const saltRounds = 12;
			const passwordHash = await bcrypt.hash(password, saltRounds);

			// Create user data
			const userData: CreateUserData = {
				fullName,
				email,
				passwordHash,
				birthDate,
				collegeName,
				country,
				ssn,
			};

			// Create user
			const user = await UserModel.create(userData);

			// Generate JWT token
			const token = jwt.sign(
				{ id: user.id, email: user.email, role: user.role },
				config.jwt.secret as string,
				{ expiresIn: config.jwt.expiresIn } as SignOptions
			);

			// Return user data without sensitive information
			const userResponse = {
				id: user.id,
				fullName: user.full_name,
				email: user.email,
				birthDate: user.birth_date,
				collegeName: user.college_name,
				country: user.country,
				avatarUrl: user.avatar_url,
				role: user.role,
				createdAt: user.created_at,
			};

			res.status(201).json({
				token,
				user: userResponse,
			});
		} catch (error) {
			console.error("Registration error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			// Validate request body
			const { error, value } = loginSchema.validate(req.body);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			const { email, password } = value;

			// Find user by email
			const user = await UserModel.findByEmail(email);
			if (!user) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(
				password,
				user.password_hash
			);
			if (!isValidPassword) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			// Generate JWT token
			const token = jwt.sign(
				{ id: user.id, email: user.email, role: user.role },
				config.jwt.secret as string,
				{ expiresIn: config.jwt.expiresIn } as SignOptions
			);

			// Return user data without sensitive information
			const userResponse = {
				id: user.id,
				fullName: user.full_name,
				email: user.email,
				birthDate: user.birth_date,
				collegeName: user.college_name,
				country: user.country,
				avatarUrl: user.avatar_url,
				role: user.role,
				createdAt: user.created_at,
			};

			res.status(200).json({
				token,
				user: userResponse,
			});
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async logout(req: Request, res: Response) {
		try {
			// For JWT tokens, logout is handled on the client side
			// We just return a success response
			res.status(200).json({ message: "Logged out successfully" });
		} catch (error) {
			console.error("Logout error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
