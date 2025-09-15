const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function createTestUser() {
	try {
		console.log("🔑 Creating test user...");

		const email = "test@save.com";
		const password = "test123";
		const hashedPassword = await bcrypt.hash(password, 12);

		// Check if user already exists
		const existingUser = await pool.query(
			"SELECT id FROM users WHERE email = $1",
			[email]
		);

		if (existingUser.rows.length > 0) {
			console.log("User already exists:", existingUser.rows[0]);
		} else {
			// Create new user
			const result = await pool.query(
				"INSERT INTO users (full_name, email, password_hash, birth_date, college_name, country, ssn) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email",
				[
					"Test User",
					email,
					hashedPassword,
					"1990-01-01",
					"Test College",
					"Test Country",
					"TEST123",
				]
			);

			console.log("✅ Test user created:", result.rows[0]);
		}

		console.log("\n📝 Test credentials:");
		console.log("Email:", email);
		console.log("Password:", password);
	} catch (error) {
		console.error("❌ Error creating test user:", error);
	} finally {
		await pool.end();
	}
}

createTestUser();
