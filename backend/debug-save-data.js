const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function checkSaveData() {
	try {
		console.log("🔍 Checking paper_interactions table...");

		// Check all saves
		const saves = await pool.query(
			"SELECT * FROM paper_interactions WHERE interaction_type = 'save' ORDER BY created_at DESC"
		);
		console.log("Current saves in database:", saves.rows);

		// Check save counts by paper
		const counts = await pool.query(
			"SELECT paper_id, COUNT(*) as count FROM paper_interactions WHERE interaction_type = 'save' GROUP BY paper_id"
		);
		console.log("Save counts by paper:", counts.rows);

		// Check table structure
		const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'paper_interactions' 
      ORDER BY ordinal_position
    `);
		console.log("Table structure:", structure.rows);

		// Check if there are any users
		const users = await pool.query(
			"SELECT id, full_name, email FROM users ORDER BY id"
		);
		console.log("Available users:", users.rows);

		// Check if there are any papers
		const papers = await pool.query(
			"SELECT id, title, author_id FROM papers ORDER BY id"
		);
		console.log("Available papers:", papers.rows);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await pool.end();
	}
}

checkSaveData();
