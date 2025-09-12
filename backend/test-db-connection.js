const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

async function testConnection() {
	console.log("🔍 Testing database connection...");
	console.log("Configuration:");
	console.log(`  Host: ${process.env.DB_HOST}`);
	console.log(`  Port: ${process.env.DB_PORT}`);
	console.log(`  Database: ${process.env.DB_NAME}`);
	console.log(`  User: ${process.env.DB_USER}`);
	console.log("");

	try {
		const client = await pool.connect();
		const result = await client.query(
			"SELECT NOW() as current_time, version() as version"
		);

		console.log("✅ Database connected successfully!");
		console.log(`Current time: ${result.rows[0].current_time}`);
		console.log(
			`PostgreSQL version: ${result.rows[0].version.split(" ")[0]} ${
				result.rows[0].version.split(" ")[1]
			}`
		);

		// Test if our database exists and we can create tables
		try {
			await client.query("SELECT 1");
			console.log("✅ Database query test passed");
		} catch (queryError) {
			console.log("❌ Database query test failed:", queryError.message);
		}

		client.release();
		await pool.end();
		console.log("");
		console.log("🎉 Database setup is ready! You can now run:");
		console.log("   npm run build");
		console.log("   npm run db:migrate");
		console.log("   npm run db:seed");
		console.log("   npm run dev");
	} catch (error) {
		console.error("❌ Database connection failed!");
		console.error("Error details:", error.message);
		console.log("");
		console.log("🔧 Troubleshooting tips:");
		console.log("1. Make sure PostgreSQL is running");
		console.log("2. Check your .env file configuration");
		console.log("3. Verify database name, username, and password");
		console.log(
			"4. For Docker: docker run --name scholarstream-postgres -e POSTGRES_PASSWORD=scholarstream123 -e POSTGRES_DB=scholarstream -p 5432:5432 -d postgres:15"
		);
		console.log("");
		process.exit(1);
	}
}

// Handle Ctrl+C gracefully
process.on("SIGINT", async () => {
	console.log("\n🛑 Test interrupted");
	await pool.end();
	process.exit(0);
});

testConnection();
