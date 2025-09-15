const fs = require("fs");
const path = require("path");

// Import the db connection from the built files
const dbPath = path.join(__dirname, "dist", "config", "db.js");

if (!fs.existsSync(dbPath)) {
	console.log("Building backend first...");
	require("child_process").execSync("npm run build", { stdio: "inherit" });
}

const { db } = require("./dist/config/db");

async function runMigration() {
	try {
		console.log("Running owner role migration...");

		const migrationPath = path.join(
			__dirname,
			"src/config/migrations",
			"002_add_owner_role.sql"
		);
		const migrationSQL = fs.readFileSync(migrationPath, "utf8");

		// Split SQL statements and execute them one by one
		const statements = migrationSQL
			.split(";")
			.map((stmt) => stmt.trim())
			.filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

		for (const statement of statements) {
			if (statement.length > 0) {
				console.log("Executing:", statement.substring(0, 50) + "...");
				await db.query(statement);
			}
		}

		console.log("Migration completed successfully!");
		console.log("Owner role is now available for users.");
	} catch (error) {
		console.error("Migration failed:", error.message);

		// If the constraint already exists or doesn't exist, handle it
		if (error.message.includes("does not exist")) {
			console.log("Constraint may already be updated - that's fine.");
		} else if (error.message.includes("already exists")) {
			console.log("Constraint already exists - skipping migration.");
		} else {
			throw error;
		}
	} finally {
		process.exit(0);
	}
}

runMigration();
