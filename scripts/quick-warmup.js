#!/usr/bin/env node

/**
 * Quick Warmup Script
 * Warms up only the most important pages for fast development
 */

const http = require("http");

const quickRoutes = [
	// Essential pages (must be fast)
	"/", // Landing page
	"/home", // Main dashboard
	"/login", // Authentication
	"/register", // Registration
	"/categories", // Categories browse

	// Important user routes
	"/profile", // User profile
	"/upload", // Paper upload
	"/admin", // Admin dashboard

	// Sample dynamic routes for components
	"/categories/computer-science", // Sample category
	"/categories/biology", // Another category
	"/papers/sample-paper-1", // Sample paper
	"/papers/research-paper-ai", // Another paper
];

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function quickWarmup() {
	console.log("🔥 Quick Warmup Starting...");
	console.log(`📍 Target: ${baseUrl}`);
	console.log(`🎯 Warming ${quickRoutes.length} essential routes\n`);

	const startTime = Date.now();
	const results = [];

	for (const route of quickRoutes) {
		try {
			const result = await warmupRoute(route);
			results.push(result);
		} catch (error) {
			results.push({ route, error: error.message, success: false });
		}
	}

	const endTime = Date.now();
	const totalTime = ((endTime - startTime) / 1000).toFixed(2);

	console.log(`\n🎉 Quick warmup completed in ${totalTime}s`);
	console.log("🚀 Essential pages are ready!");

	return results;
}

async function warmupRoute(route) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		console.log(`🌡️  ${route}...`);

		const req = http.get(`${baseUrl}${route}`, (res) => {
			const duration = Date.now() - startTime;
			console.log(`✅ ${route} - ${res.statusCode} (${duration}ms)`);
			resolve({ route, status: res.statusCode, duration, success: true });
		});

		req.on("error", (err) => {
			console.log(`❌ ${route} - ${err.message}`);
			reject(err);
		});

		req.setTimeout(15000, () => {
			req.destroy();
			reject(new Error("Timeout after 15s"));
		});
	});
}

// Check if server is running
console.log("🔍 Checking server...");
http
	.get(baseUrl, (res) => {
		console.log("✅ Server is running!\n");
		quickWarmup();
	})
	.on("error", (err) => {
		console.log("❌ Server not running. Start it first:");
		console.log("   npm run dev");
		console.log("   # or");
		console.log("   npm run docker:dev\n");
		process.exit(1);
	});
