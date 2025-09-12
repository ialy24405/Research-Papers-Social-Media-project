import request from "supertest";
import app from "../src/app";
import { db } from "../src/config/db";
import { describe, it, beforeAll, expect } from "@jest/globals";

describe("Categories Endpoints", () => {
	beforeAll(async () => {
		// Ensure database is connected and seeded
		await db.query("SELECT 1");
	});

	describe("GET /api/categories", () => {
		it("should return all categories", async () => {
			const response = await request(app).get("/api/categories");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);

			// Check structure of first category
			const category = response.body[0];
			expect(category).toHaveProperty("id");
			expect(category).toHaveProperty("name");
			expect(category).toHaveProperty("description");
		});
	});

	describe("GET /api/categories/:id", () => {
		it("should return a specific category", async () => {
			const response = await request(app).get("/api/categories/cs");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("id", "cs");
			expect(response.body).toHaveProperty("name");
			expect(response.body.name).toContain("Computer Science");
		});

		it("should return 404 for non-existent category", async () => {
			const response = await request(app).get("/api/categories/nonexistent");

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error");
		});
	});
});
