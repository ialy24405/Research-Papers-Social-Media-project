const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

async function checkReactionsTable() {
	console.log("Checking paper_reactions table...");

	try {
		// Check if table exists and get structure
		const tableInfo = await pool.query(`
			SELECT column_name, data_type, is_nullable, column_default
			FROM information_schema.columns 
			WHERE table_name = 'paper_reactions'
			ORDER BY ordinal_position;
		`);

		if (tableInfo.rows.length === 0) {
			console.log("❌ paper_reactions table does not exist");
			return;
		}

		console.log("✅ paper_reactions table exists:");
		console.table(tableInfo.rows);

		// Check if there are any reactions
		const count = await pool.query("SELECT COUNT(*) FROM paper_reactions");
		console.log(`\nTotal reactions in database: ${count.rows[0].count}`);

		// Show all reactions if any exist
		if (parseInt(count.rows[0].count) > 0) {
			const reactions = await pool.query(
				"SELECT * FROM paper_reactions ORDER BY created_at DESC LIMIT 10"
			);
			console.log("\nRecent reactions:");
			console.table(reactions.rows);
		}
	} catch (error) {
		console.error("Error checking table:", error.message);
	} finally {
		await pool.end();
	}
}

checkReactionsTable();
