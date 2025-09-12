#!/usr/bin/env node

/**
 * Development Server Startup with Warmup
 * Starts the dev server and automatically warms it up
 */

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const WARMUP_DELAY = 5000; // Wait 5 seconds after server starts
const MAX_WAIT_TIME = 60000; // Max 60 seconds to wait for server

async function waitForServer(url, maxWait = MAX_WAIT_TIME) {
	const startTime = Date.now();

	while (Date.now() - startTime < maxWait) {
		try {
			await new Promise((resolve, reject) => {
				const req = http.get(url, (res) => resolve(res));
				req.on("error", reject);
				req.setTimeout(3000, () => {
					req.destroy();
					reject(new Error("Timeout"));
				});
			});
			return true;
		} catch (error) {
			// Server not ready yet, wait a bit
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
	return false;
}

async function runWarmup() {
	const warmupScript = path.join(__dirname, "quick-warmup.js");

	return new Promise((resolve) => {
		const warmup = spawn("node", [warmupScript], {
			stdio: "inherit",
			shell: true,
		});

		warmup.on("close", (code) => {
			resolve(code === 0);
		});
	});
}

async function startDevWithWarmup() {
	console.log("🚀 Starting Development Server with Auto-Warmup");
	console.log("================================================\n");

	// Start Next.js dev server
	console.log("📦 Starting Next.js development server...");
	const devServer = spawn("npm", ["run", "dev"], {
		stdio: "inherit",
		shell: true,
		detached: false,
	});

	// Handle server startup
	console.log("⏳ Waiting for server to be ready...");

	// Wait a bit for server to start
	await new Promise((resolve) => setTimeout(resolve, WARMUP_DELAY));

	// Check if server is running
	const serverReady = await waitForServer("http://localhost:3000");

	if (serverReady) {
		console.log("\n✅ Server is ready!");
		console.log("🔥 Starting warmup process...\n");

		// Run warmup
		const warmupSuccess = await runWarmup();

		if (warmupSuccess) {
			console.log("\n🎉 Development environment is ready!");
			console.log("📱 Open: http://localhost:3000");
			console.log("⚡ Pages should load instantly now!\n");
		} else {
			console.log("\n⚠️  Warmup failed, but server is running");
			console.log("📱 Open: http://localhost:3000\n");
		}
	} else {
		console.log("\n❌ Server failed to start or took too long");
		console.log("💡 Try running manually: npm run dev\n");
	}

	// Keep the process running
	process.on("SIGINT", () => {
		console.log("\n👋 Shutting down development server...");
		devServer.kill("SIGINT");
		process.exit(0);
	});
}

startDevWithWarmup();
