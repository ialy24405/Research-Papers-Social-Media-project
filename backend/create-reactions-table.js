const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

async function createReactionsTable() {
	console.log("Creating paper_reactions table...");

	try {
		const client = await pool.connect();

		// Create the table
		await client.query(`
			CREATE TABLE IF NOT EXISTS paper_reactions (
				id SERIAL PRIMARY KEY,
				paper_id INTEGER NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'support', 'insightful')),
				created_at TIMESTAMPTZ DEFAULT NOW(),
				updated_at TIMESTAMPTZ DEFAULT NOW(),
				CONSTRAINT unique_paper_user_reaction UNIQUE(paper_id, user_id)
			);
		`);

		// Create indexes
		await client.query(
			"CREATE INDEX IF NOT EXISTS idx_paper_reactions_paper ON paper_reactions(paper_id);"
		);
		await client.query(
			"CREATE INDEX IF NOT EXISTS idx_paper_reactions_user ON paper_reactions(user_id);"
		);
		await client.query(
			"CREATE INDEX IF NOT EXISTS idx_paper_reactions_type ON paper_reactions(reaction_type);"
		);
		await client.query(
			"CREATE INDEX IF NOT EXISTS idx_paper_reactions_created_at ON paper_reactions(created_at);"
		);

		console.log("✅ paper_reactions table created successfully!");

		client.release();
	} catch (error) {
		if (error.message.includes("already exists")) {
			console.log("✅ paper_reactions table already exists");
		} else {
			console.error("❌ Error creating table:", error.message);
		}
	} finally {
		await pool.end();
		process.exit(0);
	}
}

createReactionsTable();
