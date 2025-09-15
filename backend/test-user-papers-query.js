const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function testUserPapersQuery() {
	try {
		console.log("Testing findByAuthor query for user 10...");

		const query = `
      SELECT p.*, 
             COALESCE(reactions.count, 0) as reaction_count,
             COALESCE(comments.count, 0) as comment_count,
             COALESCE(saves.count, 0) as save_count
      FROM papers p
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
      WHERE p.author_id = $1
      ORDER BY p.created_at DESC
    `;

		const result = await pool.query(query, [10]);

		console.log("Query results:");
		result.rows.forEach((row) => {
			console.log({
				id: row.id,
				title: row.title,
				status: row.status,
				reaction_count: row.reaction_count,
				comment_count: row.comment_count,
				save_count: row.save_count,
			});
		});
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await pool.end();
	}
}

testUserPapersQuery();
