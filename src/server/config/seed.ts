import { db } from "./db";

async function seed() {
	try {
		console.log("Seeding database with initial data...");

		// Insert sample categories
		const categories = [
			{
				id: "cs",
				name: "Computer Science",
				description:
					"Computing, algorithms, software engineering, and related fields",
				image_url:
					"https://images.unsplash.com/photo-1518709268805-4e9042af2176",
				image_hint: "Computer and technology",
			},
			{
				id: "bio",
				name: "Biology",
				description:
					"Life sciences, genetics, ecology, and biological research",
				image_url:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
				image_hint: "Microscope and lab equipment",
			},
			{
				id: "physics",
				name: "Physics",
				description:
					"Physical sciences, quantum mechanics, and theoretical physics",
				image_url:
					"https://images.unsplash.com/photo-1446776877081-d282a0f896e2",
				image_hint: "Physics formulas and equations",
			},
			{
				id: "chem",
				name: "Chemistry",
				description:
					"Chemical sciences, molecular research, and laboratory studies",
				image_url:
					"https://images.unsplash.com/photo-1532187643603-ba119ca4109e",
				image_hint: "Chemical formulas and lab equipment",
			},
			{
				id: "math",
				name: "Mathematics",
				description:
					"Pure and applied mathematics, statistics, and mathematical modeling",
				image_url:
					"https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
				image_hint: "Mathematical equations and graphs",
			},
			{
				id: "eng",
				name: "Engineering",
				description:
					"All engineering disciplines including mechanical, electrical, and civil",
				image_url:
					"https://images.unsplash.com/photo-1581094288338-2314dddb7ece",
				image_hint: "Engineering blueprints and tools",
			},
		];

		for (const category of categories) {
			await db.query(
				`INSERT INTO categories (id, name, description, image_url, image_hint) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (id) DO NOTHING`,
				[
					category.id,
					category.name,
					category.description,
					category.image_url,
					category.image_hint,
				]
			);
		}

		console.log("Database seeded successfully!");
		await db.close();
		process.exit(0);
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	}
}

seed();
