import { db } from "./db";
import fs from "fs";
import path from "path";

async function migrate() {
	try {
		const schemaPath = path.join(__dirname, "schema.sql");
		const schema = fs.readFileSync(schemaPath, "utf8");

		console.log("Running database migrations...");
		await db.query(schema);
		console.log("Database migrations completed successfully!");

		await db.close();
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
}

migrate();
