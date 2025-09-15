const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function checkUsersSchema() {
	try {
		const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

		console.log("Users table schema:");
		result.rows.forEach((row) => {
			console.log(
				`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
			);
		});
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await pool.end();
	}
}

checkUsersSchema();
