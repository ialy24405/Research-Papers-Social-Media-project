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
		console.log("Running parent_comment_id migration...");

		const migrationPath = path.join(
			__dirname,
			"migrations",
			"add_parent_comment_id.sql"
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
		console.log("paper_reactions table is now available for use.");
	} catch (error) {
		console.error("Migration failed:", error.message);

		// If the table already exists, that's fine
		if (error.message.includes("already exists")) {
			console.log("Table already exists - skipping migration.");
		}
	} finally {
		process.exit(0);
	}
}

runMigration();
