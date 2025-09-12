import request from "supertest";
import app from "../src/app";
import { it, describe } from "node:test";

describe("Simple Auth Test", () => {
	it("should attempt registration", async () => {
		const userData = {
			fullName: "Test User",
			email: "test@example.com",
			password: "password123",
			birthDate: "1995-05-15",
			collegeName: "Test University",
			country: "USA",
			ssn: "123-45-6789",
		};

		const response = await request(app)
			.post("/api/auth/register")
			.send(userData);

		console.log("Response status:", response.status);
		console.log("Response body:", response.body);
		console.log("Response text:", response.text);
	});
});
