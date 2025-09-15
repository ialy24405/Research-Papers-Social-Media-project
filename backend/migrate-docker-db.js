const { Pool } = require("pg");
require("dotenv").config();

// Use your Docker database connection
const pool = new Pool({
	user: process.env.DB_USER || "postgres",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "scholarstream",
	password: process.env.DB_PASSWORD || "your_password",
	port: process.env.DB_PORT || 5432,
});

async function addParentCommentIdColumn() {
	const client = await pool.connect();

	try {
		console.log("🔄 Connecting to Docker database...");

		// Check if column already exists
		const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'paper_interactions' 
      AND column_name = 'parent_comment_id'
    `;

		const columnExists = await client.query(checkColumnQuery);

		if (columnExists.rows.length > 0) {
			console.log("✅ Column parent_comment_id already exists");
			return;
		}

		console.log("🔄 Adding parent_comment_id column...");

		// Add the column
		await client.query(`
      ALTER TABLE paper_interactions 
      ADD COLUMN parent_comment_id INTEGER REFERENCES paper_interactions(id) ON DELETE CASCADE
    `);

		console.log("✅ Column parent_comment_id added successfully");

		// Create index for performance
		console.log("🔄 Creating index...");
		await client.query(`
      CREATE INDEX IF NOT EXISTS idx_paper_interactions_parent_comment_id 
      ON paper_interactions(parent_comment_id)
    `);

		console.log("✅ Index created successfully");
		console.log("🎉 Migration completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		throw error;
	} finally {
		client.release();
		await pool.end();
	}
}

addParentCommentIdColumn()
	.then(() => {
		console.log("✅ Database migration completed");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	});
