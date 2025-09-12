import request from "supertest";
import app from "../src/app";
import { db } from "../src/config/db";
import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";

describe("Paper Endpoints", () => {
	let authToken: string;
	let adminToken: string;
	let testUserId: number;

	beforeAll(async () => {
		// Create test user and get auth token
		const userResponse = await request(app).post("/api/auth/register").send({
			fullName: "Test Paper User",
			email: "paper.test@example.com",
			password: "password123",
			birthDate: "1995-05-15",
			collegeName: "Test University",
			country: "USA",
			ssn: "123-45-6789",
		});

		authToken = userResponse.body.token;
		testUserId = userResponse.body.user.id;

		// Create admin user
		const adminResponse = await request(app).post("/api/auth/register").send({
			fullName: "Test Admin",
			email: "admin.test@example.com",
			password: "password123",
			birthDate: "1990-01-01",
			collegeName: "Admin University",
			country: "USA",
			ssn: "987-65-4321",
		});

		// Manually set admin role (in real app, this would be done through admin interface)
		await db.query("UPDATE users SET role = $1 WHERE id = $2", [
			"admin",
			adminResponse.body.user.id,
		]);
		adminToken = adminResponse.body.token;
	});

	afterAll(async () => {
		// Clean up test data
		await db.query("DELETE FROM papers WHERE author_id = $1", [testUserId]);
		await db.query("DELETE FROM users WHERE email LIKE $1", ["%test%"]);
	});

	describe("GET /api/papers", () => {
		it("should return approved papers by default", async () => {
			const response = await request(app).get("/api/papers");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);

			// All papers should be approved
			response.body.forEach((paper: any) => {
				expect(paper).toHaveProperty("id");
				expect(paper).toHaveProperty("name");
				expect(paper).toHaveProperty("authorName");
				expect(paper).toHaveProperty("createdAt");
				expect(paper).toHaveProperty("interactions");
			});
		});

		it("should filter papers by category", async () => {
			const response = await request(app).get("/api/papers?categoryId=cs");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
		});

		it("should limit results", async () => {
			const response = await request(app).get("/api/papers?limit=5");

			expect(response.status).toBe(200);
			expect(response.body.length).toBeLessThanOrEqual(5);
		});
	});

	describe("POST /api/papers/upload", () => {
		it("should require authentication", async () => {
			const response = await request(app).post("/api/papers/upload").send({
				title: "Test Paper",
				description: "A test paper description",
				categoryId: "cs",
			});

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty("error");
		});

		it("should reject upload without PDF file", async () => {
			const response = await request(app)
				.post("/api/papers/upload")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					title: "Test Paper",
					description: "A test paper description",
					categoryId: "cs",
				});

			expect(response.status).toBe(400);
			expect(response.body.error).toContain("PDF file is required");
		});

		// Note: Testing file upload requires mock files or fixtures
		// This would need additional setup for multipart/form-data testing
	});

	describe("GET /api/papers/:id", () => {
		let testPaperId: number;

		beforeAll(async () => {
			// Create a test paper directly in database for this test
			const result = await db.query(
				"INSERT INTO papers (title, description, author_id, category_id, pdf_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
				[
					"Test Paper for Details",
					"Test description",
					testUserId,
					"cs",
					"/test.pdf",
					"approved",
				]
			);
			testPaperId = result.rows[0].id;
		});

		it("should return paper details", async () => {
			const response = await request(app).get(`/api/papers/${testPaperId}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("id", testPaperId);
			expect(response.body).toHaveProperty("name");
			expect(response.body).toHaveProperty("description");
			expect(response.body).toHaveProperty("author");
			expect(response.body).toHaveProperty("category");
			expect(response.body).toHaveProperty("pdfUrl");
			expect(response.body).toHaveProperty("interactions");
			expect(response.body).toHaveProperty("comments");
		});

		it("should return 404 for non-existent paper", async () => {
			const response = await request(app).get("/api/papers/99999");

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error");
		});

		it("should return 400 for invalid paper ID", async () => {
			const response = await request(app).get("/api/papers/invalid");

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});
	});
});
