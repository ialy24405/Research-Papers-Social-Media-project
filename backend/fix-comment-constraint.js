const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "",
	port: 5432,
});

async function fixCommentConstraint() {
	const client = await pool.connect();

	try {
		console.log("🔍 Checking current constraints...");

		// Check current constraints
		const constraintQuery = `
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'paper_interactions' AND constraint_type = 'UNIQUE';
    `;

		const constraints = await client.query(constraintQuery);
		console.log("Current constraints:", constraints.rows);

		// Drop the problematic unique constraint if it exists
		const dropConstraintQuery = `
      ALTER TABLE paper_interactions 
      DROP CONSTRAINT IF EXISTS unique_paper_user_interaction;
    `;

		console.log("🗑️ Dropping problematic unique constraint...");
		await client.query(dropConstraintQuery);

		// Create a new constraint that allows multiple comments but keeps unique saves/reactions
		// For comments, we don't want the unique constraint
		// For saves and reactions, we do want uniqueness
		const createConstraintQuery = `
      ALTER TABLE paper_interactions 
      ADD CONSTRAINT unique_paper_user_non_comment_interaction 
      UNIQUE (paper_id, user_id, interaction_type) 
      WHERE interaction_type != 'comment';
    `;

		console.log("✅ Creating new constraint that excludes comments...");
		await client.query(createConstraintQuery);

		console.log("🎉 Database constraint fixed successfully!");
		console.log("Users can now add multiple comments to the same paper.");
	} catch (error) {
		console.error("❌ Error fixing constraint:", error);
	} finally {
		client.release();
		await pool.end();
	}
}

fixCommentConstraint();
