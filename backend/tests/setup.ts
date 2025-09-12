import { db } from "../src/config/db";
import { beforeAll, afterAll, expect } from "@jest/globals";

// Setup test environment
beforeAll(async () => {
	// Setup test database or use existing one
	console.log("🧪 Setting up test environment...");

	// You might want to use a separate test database
	// For now, we'll use the same database but be careful with tests
});

afterAll(async () => {
	// Cleanup
	console.log("🧹 Cleaning up test environment...");
	await db.close();
});

// Global test utilities
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValidJWT(): R;
		}
	}
}

// Custom matchers
expect.extend({
	toBeValidJWT(received: string) {
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
		const pass = jwtRegex.test(received);

		if (pass) {
			return {
				message: () => `expected ${received} not to be a valid JWT`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be a valid JWT`,
				pass: false,
			};
		}
	},
});

export {};
