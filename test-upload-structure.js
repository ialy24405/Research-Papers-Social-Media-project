#!/usr/bin/env node
/**
 * Test script for PDF upload functionality
 */

const fs = require("fs");
const path = require("path");

// Test configuration
const CONFIG = {
	uploadBaseDir: "uploads",
	tempDir: "uploads/temp",
	testPaperId: 999,
	testTitle: "Test Paper: AI & Machine Learning Research!",
};

// Simulate the sanitization function from the server
function sanitizeFilename(filename) {
	return filename
		.replace(/[^a-zA-Z0-9\s\-_.]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
		.substring(0, 100); // Limit length
}

// Test the folder structure creation
function testFolderStructure() {
	console.log("🧪 Testing upload folder structure...\n");

	try {
		// Create base directories
		if (!fs.existsSync(CONFIG.uploadBaseDir)) {
			fs.mkdirSync(CONFIG.uploadBaseDir, { recursive: true });
			console.log("✅ Created base upload directory");
		} else {
			console.log("✅ Base upload directory exists");
		}

		if (!fs.existsSync(CONFIG.tempDir)) {
			fs.mkdirSync(CONFIG.tempDir, { recursive: true });
			console.log("✅ Created temp directory");
		} else {
			console.log("✅ Temp directory exists");
		}

		// Test paper-specific folder creation
		const sanitizedTitle = sanitizeFilename(CONFIG.testTitle);
		const paperFolder = path.join(
			CONFIG.uploadBaseDir,
			`paper-${CONFIG.testPaperId}`
		);
		const finalFilePath = path.join(paperFolder, `${sanitizedTitle}.pdf`);

		console.log(`\n📁 Testing paper folder: paper-${CONFIG.testPaperId}`);
		console.log(`📝 Original title: "${CONFIG.testTitle}"`);
		console.log(`🧹 Sanitized title: "${sanitizedTitle}"`);
		console.log(`📄 Final file path: "${finalFilePath}"`);

		// Create paper folder
		if (!fs.existsSync(paperFolder)) {
			fs.mkdirSync(paperFolder, { recursive: true });
			console.log("✅ Created paper-specific folder");
		} else {
			console.log("✅ Paper-specific folder exists");
		}

		// Create a test PDF file
		const testContent =
			"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF";
		fs.writeFileSync(finalFilePath, testContent);
		console.log("✅ Created test PDF file");

		// Verify file exists and is readable
		const stats = fs.statSync(finalFilePath);
		console.log(`📏 File size: ${stats.size} bytes`);
		console.log(`📅 Created: ${stats.birthtime.toISOString()}`);

		console.log("\n🎉 Upload folder structure test completed successfully!");

		// Display final structure
		console.log("\n📂 Final directory structure:");
		console.log("uploads/");
		console.log("├── temp/");
		console.log(`└── paper-${CONFIG.testPaperId}/`);
		console.log(`    └── ${sanitizedTitle}.pdf`);

		return true;
	} catch (error) {
		console.error("❌ Test failed:", error.message);
		return false;
	}
}

// Clean up test files
function cleanup() {
	console.log("\n🧹 Cleaning up test files...");

	try {
		const paperFolder = path.join(
			CONFIG.uploadBaseDir,
			`paper-${CONFIG.testPaperId}`
		);
		if (fs.existsSync(paperFolder)) {
			fs.rmSync(paperFolder, { recursive: true });
			console.log("✅ Removed test paper folder");
		}

		console.log("✅ Cleanup completed");
	} catch (error) {
		console.error("⚠️ Cleanup warning:", error.message);
	}
}

// Main test execution
if (require.main === module) {
	console.log("🚀 PDF Upload Structure Test\n");

	const success = testFolderStructure();

	if (success) {
		console.log("\n✨ All tests passed!");

		// Ask if user wants to keep test files
		const readline = require("readline");
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question("\nKeep test files? (y/N): ", (answer) => {
			if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
				cleanup();
			}
			rl.close();
		});
	} else {
		console.log("\n❌ Tests failed!");
		process.exit(1);
	}
}

module.exports = { sanitizeFilename, testFolderStructure, cleanup };
