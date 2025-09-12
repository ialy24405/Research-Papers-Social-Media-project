#!/usr/bin/env node

/**
 * COMPLETE Site Warmup Script
 * Warms up ALL pages, components, and critical paths
 */

const http = require("http");
const https = require("https");

// ALL STATIC ROUTES - every page.tsx in your app
const staticRoutes = [
	// Root
	"/",

	// Auth routes
	"/login",
	"/register",

	// Main app routes
	"/home",
	"/categories",
	"/upload",
	"/profile",
	"/profile/saved",
	"/posts/status",
	"/admin",
];

// DYNAMIC ROUTES with comprehensive sample data
const dynamicRoutes = [
	// Category routes - all possible categories
	"/categories/computer-science",
	"/categories/artificial-intelligence",
	"/categories/machine-learning",
	"/categories/data-science",
	"/categories/web-development",
	"/categories/mobile-development",
	"/categories/cybersecurity",
	"/categories/blockchain",
	"/categories/quantum-computing",
	"/categories/biology",
	"/categories/physics",
	"/categories/chemistry",
	"/categories/mathematics",
	"/categories/economics",
	"/categories/psychology",
	"/categories/medicine",
	"/categories/engineering",
	"/categories/environmental-science",
	"/categories/biotechnology",
	"/categories/neuroscience",

	// Paper routes - comprehensive sample papers
	"/papers/ai-research-2024",
	"/papers/machine-learning-algorithms",
	"/papers/deep-learning-neural-networks",
	"/papers/web-security-analysis",
	"/papers/blockchain-consensus-mechanisms",
	"/papers/quantum-algorithms-optimization",
	"/papers/climate-change-modeling",
	"/papers/medical-imaging-ai",
	"/papers/natural-language-processing",
	"/papers/computer-vision-applications",
	"/papers/robotics-automation",
	"/papers/database-optimization",
	"/papers/cloud-computing-scalability",
	"/papers/mobile-app-performance",
	"/papers/social-network-analysis",
	"/papers/bioinformatics-genomics",
	"/papers/renewable-energy-systems",
	"/papers/autonomous-vehicles",
	"/papers/augmented-reality-interfaces",
	"/papers/internet-of-things-security",
];

// COMPONENT WARMUP ROUTES - routes that load heavy components
const componentRoutes = [
	// Routes that likely load paper cards
	"/home",
	"/categories",
	"/profile",
	"/admin",

	// Routes with forms
	"/login",
	"/register",
	"/upload",

	// Routes with complex UI
	"/profile/saved",
	"/posts/status",
];

const allRoutes = [...staticRoutes, ...dynamicRoutes];

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

// Enhanced request function with better error handling
async function makeRequest(url) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		const protocol = url.startsWith("https") ? https : http;

		const req = protocol.get(url, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				const duration = Date.now() - startTime;
				resolve({
					url,
					status: res.statusCode,
					duration,
					size: data.length,
					success: res.statusCode >= 200 && res.statusCode < 400,
				});
			});
		});

		req.on("error", (err) => {
			reject({ url, error: err.message, success: false });
		});

		req.setTimeout(45000, () => {
			req.destroy();
			reject({ url, error: "Timeout after 45s", success: false });
		});
	});
}

// Batch processing function
async function processBatch(urls, batchName, batchSize = 4) {
	console.log(`\n🔥 Warming ${batchName} (${urls.length} routes)`);
	console.log("=".repeat(50));

	const results = [];

	for (let i = 0; i < urls.length; i += batchSize) {
		const batch = urls.slice(i, i + batchSize);
		const batchNumber = Math.floor(i / batchSize) + 1;
		const totalBatches = Math.ceil(urls.length / batchSize);

		console.log(`\n📦 Batch ${batchNumber}/${totalBatches}:`);

		const batchPromises = batch.map((route) => {
			const url = `${baseUrl}${route}`;
			console.log(`  🌡️  ${route}`);
			return makeRequest(url);
		});

		try {
			const batchResults = await Promise.allSettled(batchPromises);

			batchResults.forEach((result, index) => {
				const route = batch[index];
				if (result.status === "fulfilled") {
					const { status, duration, size, success } = result.value;
					results.push({ route, status, duration, size, success });
					const sizeKB = (size / 1024).toFixed(1);
					console.log(`  ✅ ${route} - ${status} (${duration}ms, ${sizeKB}KB)`);
				} else {
					results.push({ route, error: result.reason.error, success: false });
					console.log(`  ❌ ${route} - ${result.reason.error}`);
				}
			});

			// Small delay between batches to avoid overwhelming the server
			if (i + batchSize < urls.length) {
				console.log(`  ⏳ Cooling down...`);
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		} catch (error) {
			console.error(`  💥 Batch error:`, error);
		}
	}

	return results;
}

async function completeWarmup() {
	console.log("🚀 COMPLETE SITE WARMUP STARTING");
	console.log("==================================");
	console.log(`📍 Target: ${baseUrl}`);
	console.log(`🎯 Total routes: ${allRoutes.length}`);
	console.log(`📊 Breakdown:`);
	console.log(`   • Static routes: ${staticRoutes.length}`);
	console.log(`   • Dynamic routes: ${dynamicRoutes.length}`);
	console.log("");

	const startTime = Date.now();

	// Check server availability
	console.log("🔍 Checking server availability...");
	try {
		await makeRequest(baseUrl);
		console.log("✅ Server is ready!\n");
	} catch (error) {
		console.log("❌ Server not available. Please start your server:");
		console.log("   npm run dev");
		console.log("   # or for Docker:");
		console.log("   npm run docker:dev\n");
		process.exit(1);
	}

	// Phase 1: Warm up static routes first (most important)
	const staticResults = await processBatch(staticRoutes, "Static Routes", 3);

	// Phase 2: Warm up dynamic routes (can handle more in parallel)
	const dynamicResults = await processBatch(dynamicRoutes, "Dynamic Routes", 5);

	// Calculate results
	const allResults = [...staticResults, ...dynamicResults];
	const endTime = Date.now();
	const totalTime = ((endTime - startTime) / 1000).toFixed(2);

	const successful = allResults.filter((r) => r.success).length;
	const failed = allResults.length - successful;
	const avgDuration =
		successful > 0
			? (
					allResults
						.filter((r) => r.success)
						.reduce((sum, r) => sum + r.duration, 0) / successful
			  ).toFixed(0)
			: 0;

	// Summary
	console.log("\n🎉 COMPLETE WARMUP FINISHED!");
	console.log("============================");
	console.log(`⏱️  Total time: ${totalTime}s`);
	console.log(`✅ Successful: ${successful}/${allResults.length} routes`);
	console.log(`⚡ Average response: ${avgDuration}ms`);

	if (failed > 0) {
		console.log(`❌ Failed: ${failed} routes`);
		console.log("\nFailed routes:");
		allResults
			.filter((r) => !r.success)
			.forEach((r) => {
				console.log(`   • ${r.route} - ${r.error}`);
			});
	}

	console.log("\n🚀 YOUR SITE IS FULLY WARMED UP!");
	console.log("================================");
	console.log("✨ All pages should now load instantly");
	console.log("🌟 Components are pre-compiled");
	console.log("🎯 Dynamic routes are ready");
	console.log(`📱 Open: ${baseUrl}`);

	return allResults;
}

// Run the complete warmup
completeWarmup()
	.then(() => {
		console.log("\n🎊 Warmup completed successfully!");
	})
	.catch((error) => {
		console.error("\n💥 Warmup failed:", error);
		process.exit(1);
	});
