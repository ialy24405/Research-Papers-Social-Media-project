import { db } from "../../config/db";

export interface Category {
	id: string;
	name: string;
	description?: string;
	image_url?: string;
	image_hint?: string;
}

export interface CreateCategoryData {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	imageHint?: string;
}

export class CategoryModel {
	static async findAll(): Promise<Category[]> {
		const query = "SELECT * FROM categories ORDER BY name";
		const result = await db.query(query);
		return result.rows;
	}

	static async findById(id: string): Promise<Category | null> {
		const query = "SELECT * FROM categories WHERE id = $1";
		const result = await db.query(query, [id]);
		return result.rows[0] || null;
	}

	static async create(categoryData: CreateCategoryData): Promise<Category> {
		const query = `
      INSERT INTO categories (id, name, description, image_url, image_hint)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

		const values = [
			categoryData.id,
			categoryData.name,
			categoryData.description,
			categoryData.imageUrl,
			categoryData.imageHint,
		];

		const result = await db.query(query, values);
		return result.rows[0];
	}

	static async delete(id: string): Promise<void> {
		const query = "DELETE FROM categories WHERE id = $1";
		await db.query(query, [id]);
	}

	static async update(
		id: string,
		categoryData: Partial<CreateCategoryData>
	): Promise<Category | null> {
		const fields = [];
		const values = [];
		let paramIndex = 1;

		if (categoryData.name) {
			fields.push(`name = $${paramIndex}`);
			values.push(categoryData.name);
			paramIndex++;
		}

		if (categoryData.description !== undefined) {
			fields.push(`description = $${paramIndex}`);
			values.push(categoryData.description);
			paramIndex++;
		}

		if (categoryData.imageUrl !== undefined) {
			fields.push(`image_url = $${paramIndex}`);
			values.push(categoryData.imageUrl);
			paramIndex++;
		}

		if (categoryData.imageHint !== undefined) {
			fields.push(`image_hint = $${paramIndex}`);
			values.push(categoryData.imageHint);
			paramIndex++;
		}

		if (fields.length === 0) {
			return null;
		}

		values.push(id);
		const query = `
      UPDATE categories 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

		const result = await db.query(query, values);
		return result.rows[0] || null;
	}
}
