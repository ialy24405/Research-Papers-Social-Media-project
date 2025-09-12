import { Pool } from "pg";
import { config } from "./index";

class Database {
	private pool: Pool;

	constructor() {
		this.pool = new Pool({
			host: config.database.host,
			port: config.database.port,
			database: config.database.name,
			user: config.database.user,
			password: config.database.password,
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		this.pool.on("error", (err) => {
			console.error("Unexpected error on idle client", err);
			process.exit(-1);
		});
	}

	async query(text: string, params?: any[]): Promise<any> {
		const start = Date.now();
		try {
			const res = await this.pool.query(text, params);
			const duration = Date.now() - start;
			console.log("Executed query", { text, duration, rows: res.rowCount });
			return res;
		} catch (error) {
			console.error("Database query error:", error);
			throw error;
		}
	}

	async getClient() {
		return this.pool.connect();
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}

export const db = new Database();
