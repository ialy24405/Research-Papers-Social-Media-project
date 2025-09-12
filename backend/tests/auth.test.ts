import request from "supertest";
import app from "../src/app";
import { db } from "../src/config/db";
import { describe, beforeEach, before, after, it } from "node:test";
import { expect } from "@jest/globals";

describe("Authentication Endpoints", () => {
	before(async () => {
		// Ensure database is connected
		await db.query("SELECT 1");
	});

	after(async () => {
		// Clean up test users
		await db.query("DELETE FROM users WHERE email LIKE $1", ["%test%"]);
	});

	describe("POST /api/auth/register", () => {
		const validUserData = {
			fullName: "John Doe Test",
			email: "john.test@example.com",
			password: "password123",
			birthDate: "1995-05-15",
			collegeName: "Test University",
			country: "USA",
			ssn: "123-45-6789",
		};

		it("should register a new user successfully", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send(validUserData);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("token");
			expect(response.body).toHaveProperty("user");
			expect(response.body.user.email).toBe(validUserData.email);
			expect(response.body.user.fullName).toBe(validUserData.fullName);
			expect(response.body.user).not.toHaveProperty("password");
			expect(response.body.token).toMatch(
				/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
			);
		});

		it("should reject registration with invalid email", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					...validUserData,
					email: "invalid-email",
				});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});

		it("should reject registration with missing fields", async () => {
			const response = await request(app).post("/api/auth/register").send({
				email: "test@example.com",
				password: "password123",
				// Missing required fields
			});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});

		it("should reject registration with duplicate email", async () => {
			// First registration
			await request(app)
				.post("/api/auth/register")
				.send({
					...validUserData,
					email: "duplicate.test@example.com",
				});

			// Second registration with same email
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					...validUserData,
					email: "duplicate.test@example.com",
				});

			expect(response.status).toBe(409);
			expect(response.body.error).toContain("already exists");
		});

		it("should reject weak passwords", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					...validUserData,
					password: "123",
				});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});
	});

	describe("POST /api/auth/login", () => {
		const testUser = {
			fullName: "Login Test User",
			email: "login.test@example.com",
			password: "password123",
			birthDate: "1995-05-15",
			collegeName: "Test University",
			country: "USA",
			ssn: "123-45-6789",
		};

		beforeEach(async () => {
			// Create a test user for login tests
			await request(app).post("/api/auth/register").send(testUser);
		});

		it("should login successfully with valid credentials", async () => {
			const response = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: testUser.password,
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("token");
			expect(response.body).toHaveProperty("user");
			expect(response.body.user.email).toBe(testUser.email);
			expect(response.body.token).toMatch(
				/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
			);
		});

		it("should reject login with invalid email", async () => {
			const response = await request(app).post("/api/auth/login").send({
				email: "nonexistent@example.com",
				password: testUser.password,
			});

			expect(response.status).toBe(401);
			expect(response.body.error).toContain("Invalid credentials");
		});

		it("should reject login with invalid password", async () => {
			const response = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: "wrongpassword",
			});

			expect(response.status).toBe(401);
			expect(response.body.error).toContain("Invalid credentials");
		});

		it("should reject login with missing fields", async () => {
			const response = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				// Missing password
			});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});
	});
});
