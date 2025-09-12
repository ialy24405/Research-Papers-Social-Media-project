#!/usr/bin/env node

const http = require("http");

// Complete list of ALL routes in your Next.js app
const staticRoutes = [
	// Root and main pages
	"/",
	"/home",
	"/login",
	"/register",
	"/upload",
	"/profile",
	"/profile/saved",
	"/posts/status",
	"/admin",
	"/categories",
];

// Dynamic routes with sample IDs
const dynamicRoutes = [
	// Categories with sample IDs
	"/categories/computer-science",
	"/categories/biology",
	"/categories/physics",
	"/categories/chemistry",
	"/categories/mathematics",
	"/categories/economics",
	"/categories/engineering",
	"/categories/medicine",
	"/categories/psychology",
	"/categories/environmental-science",

	// Papers with sample IDs
	"/papers/sample-paper-1",
	"/papers/sample-paper-2",
	"/papers/sample-paper-3",
	"/papers/research-paper-ai",
	"/papers/research-paper-ml",
	"/papers/research-paper-web",
	"/papers/research-paper-data",
	"/papers/research-paper-security",
	"/papers/research-paper-blockchain",
	"/papers/research-paper-quantum",
];

// Combine all routes
const routes = [...staticRoutes, ...dynamicRoutes];

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function warmupRoute(route) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		const req = http.get(`${baseUrl}${route}`, (res) => {
			const duration = Date.now() - startTime;
			console.log(`✓ ${route} (${res.statusCode}) - ${duration}ms`);
			resolve({ route, status: res.statusCode, duration });
		});

		req.on("error", (err) => {
			console.log(`✗ ${route} - Error: ${err.message}`);
			reject(err);
		});

		req.setTimeout(30000, () => {
			req.destroy();
			console.log(`✗ ${route} - Timeout`);
			reject(new Error("Timeout"));
		});
	});
}

async function warmupAllRoutes() {
	console.log(`🔥 Warming up ${routes.length} routes...`);
	console.log(`Base URL: ${baseUrl}\n`);

	const startTime = Date.now();
	const results = [];

	// Warm up routes in parallel (but limit concurrency)
	const concurrency = 3;
	for (let i = 0; i < routes.length; i += concurrency) {
		const batch = routes.slice(i, i + concurrency);
		const batchPromises = batch.map((route) =>
			warmupRoute(route).catch((err) => ({ route, error: err.message }))
		);

		const batchResults = await Promise.all(batchPromises);
		results.push(...batchResults);

		// Small delay between batches to avoid overwhelming the server
		if (i + concurrency < routes.length) {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}

	const totalTime = Date.now() - startTime;
	const successful = results.filter((r) => !r.error).length;

	console.log(`\n🎉 Warmup complete!`);
	console.log(`✓ ${successful}/${routes.length} routes successful`);
	console.log(`⏱️  Total time: ${totalTime}ms`);

	if (successful < routes.length) {
		console.log(`\n❌ Failed routes:`);
		results
			.filter((r) => r.error)
			.forEach((r) => {
				console.log(`  - ${r.route}: ${r.error}`);
			});
	}
}

// Run if called directly
if (require.main === module) {
	warmupAllRoutes().catch(console.error);
}

module.exports = { warmupAllRoutes, warmupRoute };
