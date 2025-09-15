const { Pool } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "scholarstream",
	password: "scholarstream123",
	port: 5432,
});

async function checkUser() {
	try {
		const result = await pool.query(
			"SELECT id, email, password_hash FROM users WHERE email = 'ialy24405@gmail.com'"
		);
		console.log("User data:", result.rows[0]);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await pool.end();
	}
}

checkUser();
