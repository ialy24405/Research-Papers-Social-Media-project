const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function testSaveFunctionality() {
	try {
		console.log("🧪 Testing save functionality at database level...");

		const userId = 10; // Aly Ibrahim
		const paperId = 1; // First paper

		// Check if already saved
		console.log("\n1. Checking if paper is already saved...");
		const existingResult = await pool.query(
			"SELECT * FROM paper_interactions WHERE paper_id = $1 AND user_id = $2 AND interaction_type = $3",
			[paperId, userId, "save"]
		);

		console.log("Existing save:", existingResult.rows);

		if (existingResult.rows.length > 0) {
			console.log("Paper already saved, removing it first...");
			await pool.query(
				"DELETE FROM paper_interactions WHERE paper_id = $1 AND user_id = $2 AND interaction_type = $3",
				[paperId, userId, "save"]
			);
			console.log("✅ Removed existing save");
		}

		// Save the paper
		console.log("\n2. Saving paper...");
		await pool.query(
			"INSERT INTO paper_interactions (paper_id, user_id, interaction_type) VALUES ($1, $2, $3)",
			[paperId, userId, "save"]
		);
		console.log("✅ Paper saved successfully");

		// Verify save
		console.log("\n3. Verifying save...");
		const verifyResult = await pool.query(
			"SELECT * FROM paper_interactions WHERE paper_id = $1 AND user_id = $2 AND interaction_type = $3",
			[paperId, userId, "save"]
		);
		console.log("Save verification:", verifyResult.rows);

		// Test the getSavedPapers query
		console.log("\n4. Testing getSavedPapers query...");
		const savedPapersQuery = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name,
        COALESCE(reactions.count, 0) as reaction_count,
        COALESCE(comments.count, 0) as comment_count,
        COALESCE(saves.count, 0) as save_count
      FROM papers p
      INNER JOIN paper_interactions pi ON p.id = pi.paper_id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT paper_id, COUNT(*) as count 
        FROM paper_reactions 
        GROUP BY paper_id
      ) reactions ON p.id = reactions.paper_id
      LEFT JOIN (
        SELECT paper_id, COUNT(*) as count 
        FROM paper_interactions 
        WHERE interaction_type = 'comment' 
        GROUP BY paper_id
      ) comments ON p.id = comments.paper_id
      LEFT JOIN (
        SELECT paper_id, COUNT(*) as count 
        FROM paper_interactions 
        WHERE interaction_type = 'save' 
        GROUP BY paper_id
      ) saves ON p.id = saves.paper_id
      WHERE pi.user_id = $1 AND pi.interaction_type = 'save'
      ORDER BY pi.created_at DESC
    `;

		const savedPapersResult = await pool.query(savedPapersQuery, [userId]);
		console.log(
			"Saved papers result:",
			savedPapersResult.rows.map((row) => ({
				id: row.id,
				title: row.title,
				author_name: row.author_name,
				reaction_count: row.reaction_count,
				comment_count: row.comment_count,
				save_count: row.save_count,
			}))
		);
	} catch (error) {
		console.error("❌ Test error:", error);
	} finally {
		await pool.end();
	}
}

testSaveFunctionality();
