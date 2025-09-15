const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

async function testAuthenticatedReaction() {
	try {
		// Get a user from the database
		const users = await pool.query("SELECT * FROM users LIMIT 1");

		if (users.rows.length === 0) {
			console.log("❌ No users found in database");
			return;
		}

		const user = users.rows[0];
		console.log(`✅ Found user: ${user.full_name} (${user.email})`);

		// Create a JWT token for this user
		const token = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_SECRET || "your-secret-key",
			{ expiresIn: "24h" }
		);

		console.log(`🔑 Generated token: ${token.substring(0, 50)}...`);

		// Now test the reaction API with authentication
		const http = require("http");

		const postData = JSON.stringify({
			paperId: 1,
			reactionType: "like",
		});

		const options = {
			hostname: "localhost",
			port: 3005,
			path: "/api/reactions/toggle",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
				"Content-Length": Buffer.byteLength(postData),
			},
		};

		const req = http.request(options, (res) => {
			console.log(`\n🔄 Reaction API with auth - Status: ${res.statusCode}`);

			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				console.log("✅ Reaction Response:", data);

				// Check database for the reaction
				checkDatabaseReactions();
			});
		});

		req.on("error", (e) => {
			console.error(`❌ Problem with request: ${e.message}`);
		});

		req.write(postData);
		req.end();
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

async function checkDatabaseReactions() {
	try {
		// Wait a moment for the database write to complete
		setTimeout(async () => {
			console.log("\n🔍 Checking database for reactions...");
			const reactions = await pool.query("SELECT * FROM paper_reactions");
			console.log(`Total reactions now: ${reactions.rows.length}`);

			if (reactions.rows.length > 0) {
				console.log("🎉 Reactions found in database:");
				console.table(reactions.rows);
			}

			await pool.end();
		}, 1000);
	} catch (error) {
		console.error("❌ Error checking reactions:", error.message);
		await pool.end();
	}
}

testAuthenticatedReaction();
