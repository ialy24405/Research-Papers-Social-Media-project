import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: process.env.POSTGRES_URL,
			ssl:
				process.env.NODE_ENV === "production"
					? { rejectUnauthorized: false }
					: false,
			max: 5,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000,
		});
	}
	return pool;
}

export async function query(text: string, params?: any[]) {
	try {
		const start = Date.now();
		const res = await getDbPool().query(text, params);
		const duration = Date.now() - start;

		if (process.env.NODE_ENV === "development") {
			console.log("Query executed:", {
				text: text.substring(0, 100),
				duration,
				rows: res.rowCount,
			});
		}

		return res;
	} catch (error) {
		console.error("Database query error:", error);
		throw error;
	}
}
