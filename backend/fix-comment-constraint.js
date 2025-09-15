const { Pool } = require("pg");
require("dotenv").config();

// Use your Docker database connection
const pool = new Pool({
	user: process.env.DB_USER || "papers_user",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "papers_social_media",
	password: process.env.DB_PASSWORD || "papers_password",
	port: process.env.DB_PORT || 5432,
});

async function fixCommentConstraint() {
	const client = await pool.connect();

	try {
		console.log("🔄 Connecting to Docker database...");

		// Check if the old constraint exists
		const checkConstraintQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'paper_interactions' 
      AND constraint_name = 'unique_paper_user_interaction'
    `;

		const constraintExists = await client.query(checkConstraintQuery);

		if (constraintExists.rows.length === 0) {
			console.log("✅ Old constraint already removed");
		} else {
			console.log("🔄 Removing old unique constraint...");
			await client.query(`
				ALTER TABLE paper_interactions 
				DROP CONSTRAINT IF EXISTS unique_paper_user_interaction
			`);
			console.log("✅ Old constraint removed");
		}

		// Check if new index already exists
		const checkIndexQuery = `
			SELECT indexname 
			FROM pg_indexes 
			WHERE tablename = 'paper_interactions' 
			AND indexname = 'unique_paper_user_non_comment_interaction'
		`;

		const indexExists = await client.query(checkIndexQuery);

		if (indexExists.rows.length > 0) {
			console.log("✅ New constraint already exists");
		} else {
			console.log("🔄 Creating new partial unique constraint...");
			await client.query(`
				CREATE UNIQUE INDEX IF NOT EXISTS unique_paper_user_non_comment_interaction 
				ON paper_interactions(paper_id, user_id, interaction_type) 
				WHERE interaction_type != 'comment'
			`);
			console.log("✅ New constraint created successfully");
		}

		console.log("🎉 Migration completed successfully!");
		console.log("Users can now post multiple comments on the same paper!");
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		throw error;
	} finally {
		client.release();
		await pool.end();
	}
}

// Run the migration
if (require.main === module) {
	fixCommentConstraint().catch((error) => {
		console.error("Migration failed:", error);
		process.exit(1);
	});
}

module.exports = { fixCommentConstraint };
