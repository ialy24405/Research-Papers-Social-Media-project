#!/usr/bin/env node

/**
 * Environment Configuration Setup Script
 *
 * This script helps set up the environment configuration for different deployment scenarios.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt) {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

async function setupEnvironment() {
	console.log("\n🚀 Research Papers Project - Environment Setup\n");

	const environment = await question(
		"Select environment (1: Development, 2: Staging, 3: Production): "
	);

	let templateFile;
	let envName;

	switch (environment) {
		case "1":
			templateFile = ".env.development.example";
			envName = "Development";
			break;
		case "2":
			templateFile = ".env.staging.example";
			envName = "Staging";
			break;
		case "3":
			templateFile = ".env.production.example";
			envName = "Production";
			break;
		default:
			console.log("Invalid selection. Exiting...");
			rl.close();
			return;
	}

	console.log(`\n📝 Setting up ${envName} environment...\n`);

	// Check if template exists
	if (!fs.existsSync(templateFile)) {
		console.log(`❌ Template file ${templateFile} not found!`);
		rl.close();
		return;
	}

	// Ask for custom URLs if not development
	if (environment !== "1") {
		console.log("Please provide your backend URLs:");
		const apiUrl = await question(
			"API URL (e.g., https://api.yourdomain.com/api): "
		);
		const serverUrl = await question(
			"Server URL (e.g., https://api.yourdomain.com): "
		);

		// Read template and replace URLs
		let envContent = fs.readFileSync(templateFile, "utf8");

		if (apiUrl.trim()) {
			envContent = envContent.replace(
				/NEXT_PUBLIC_API_URL=.*/,
				`NEXT_PUBLIC_API_URL=${apiUrl}`
			);
		}

		if (serverUrl.trim()) {
			envContent = envContent.replace(
				/NEXT_PUBLIC_SERVER_URL=.*/,
				`NEXT_PUBLIC_SERVER_URL=${serverUrl}`
			);
		}

		fs.writeFileSync(".env.local", envContent);
	} else {
		// Just copy the development template
		fs.copyFileSync(templateFile, ".env.local");
	}

	console.log(`\n✅ Environment configuration created successfully!`);
	console.log(`📁 File: .env.local`);
	console.log("\n📖 Next steps:");
	console.log("1. Review the .env.local file and adjust if needed");
	console.log("2. Start your backend server");
	console.log("3. Run `npm run dev` to start the frontend");
	console.log("\n📚 For more details, see DEPLOYMENT_CONFIG.md");

	rl.close();
}

setupEnvironment().catch(console.error);
