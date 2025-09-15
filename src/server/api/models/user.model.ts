import { db } from "../../config/db";

export interface User {
	id: number;
	full_name: string;
	email: string;
	password_hash: string;
	birth_date: Date;
	college_name: string;
	country: string;
	ssn: string;
	avatar_url?: string;
	role: string;
	created_at: Date;
}

export interface CreateUserData {
	fullName: string;
	email: string;
	passwordHash: string;
	birthDate: string;
	collegeName: string;
	country: string;
	ssn: string;
}

export class UserModel {
	static async create(userData: CreateUserData): Promise<User> {
		const query = `
      INSERT INTO users (full_name, email, password_hash, birth_date, college_name, country, ssn)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

		const values = [
			userData.fullName,
			userData.email,
			userData.passwordHash,
			userData.birthDate,
			userData.collegeName,
			userData.country,
			userData.ssn,
		];

		const result = await db.query(query, values);
		return result.rows[0];
	}

	static async findByEmail(email: string): Promise<User | null> {
		const query = "SELECT * FROM users WHERE email = $1";
		const result = await db.query(query, [email]);
		return result.rows[0] || null;
	}

	static async findById(id: number): Promise<User | null> {
		const query = "SELECT * FROM users WHERE id = $1";
		const result = await db.query(query, [id]);
		return result.rows[0] || null;
	}

	static async updateAvatarUrl(id: number, avatarUrl: string): Promise<void> {
		const query = "UPDATE users SET avatar_url = $1 WHERE id = $2";
		await db.query(query, [avatarUrl, id]);
	}

	static async getUserProfile(
		id: number
	): Promise<Omit<User, "password_hash" | "ssn"> | null> {
		const query = `
      SELECT id, full_name, email, birth_date, college_name, country, 
             avatar_url, role, created_at
      FROM users 
      WHERE id = $1
    `;
		const result = await db.query(query, [id]);
		return result.rows[0] || null;
	}

	// Admin user management methods
	static async findAll(
		filters: { role?: string; search?: string } = {}
	): Promise<Omit<User, "password_hash" | "ssn">[]> {
		let query = `
			SELECT id, full_name, email, birth_date, college_name, country, 
				   avatar_url, role, created_at
			FROM users 
			WHERE 1=1
		`;
		const values: any[] = [];
		let paramCount = 1;

		if (filters.role && filters.role !== "all") {
			query += ` AND role = $${paramCount}`;
			values.push(filters.role);
			paramCount++;
		}

		if (filters.search && filters.search.trim()) {
			query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
			values.push(`%${filters.search.trim()}%`);
			paramCount++;
		}

		query += ` ORDER BY created_at DESC`;

		const result = await db.query(query, values);
		return result.rows;
	}

	static async updateRole(id: number, role: string): Promise<void> {
		const query = "UPDATE users SET role = $1 WHERE id = $2";
		await db.query(query, [role, id]);
	}

	static async deleteUser(id: number): Promise<void> {
		const query = "DELETE FROM users WHERE id = $1";
		await db.query(query, [id]);
	}

	static async updateUser(
		id: number,
		updates: Partial<Omit<User, "id" | "password_hash" | "created_at">>
	): Promise<void> {
		const setParts: string[] = [];
		const values: any[] = [];
		let paramCount = 1;

		if (updates.full_name !== undefined) {
			setParts.push(`full_name = $${paramCount}`);
			values.push(updates.full_name);
			paramCount++;
		}

		if (updates.email !== undefined) {
			setParts.push(`email = $${paramCount}`);
			values.push(updates.email);
			paramCount++;
		}

		if (updates.birth_date !== undefined) {
			setParts.push(`birth_date = $${paramCount}`);
			values.push(updates.birth_date);
			paramCount++;
		}

		if (updates.college_name !== undefined) {
			setParts.push(`college_name = $${paramCount}`);
			values.push(updates.college_name);
			paramCount++;
		}

		if (updates.country !== undefined) {
			setParts.push(`country = $${paramCount}`);
			values.push(updates.country);
			paramCount++;
		}

		if (updates.avatar_url !== undefined) {
			setParts.push(`avatar_url = $${paramCount}`);
			values.push(updates.avatar_url);
			paramCount++;
		}

		if (setParts.length === 0) {
			return; // No updates to make
		}

		const query = `UPDATE users SET ${setParts.join(
			", "
		)} WHERE id = $${paramCount}`;
		values.push(id);

		await db.query(query, values);
	}

	static async getRecentInteractions(userId: number, limit: number = 20) {
		const query = `
			SELECT 
				'reaction' as interaction_type,
				pr.reaction_type as action,
				pr.created_at,
				p.id as paper_id,
				p.title as paper_title,
				p.author_id as paper_author_id,
				u.full_name as paper_author_name,
				c.name as category_name
			FROM paper_reactions pr
			INNER JOIN papers p ON pr.paper_id = p.id
			INNER JOIN users u ON p.author_id = u.id
			INNER JOIN categories c ON p.category_id = c.id
			WHERE pr.user_id = $1
			
			UNION ALL
			
			SELECT 
				pi.interaction_type,
				CASE 
					WHEN pi.interaction_type = 'comment' THEN 'commented'
					WHEN pi.interaction_type = 'save' THEN 'saved'
					ELSE pi.interaction_type
				END as action,
				pi.created_at,
				p.id as paper_id,
				p.title as paper_title,
				p.author_id as paper_author_id,
				u.full_name as paper_author_name,
				c.name as category_name
			FROM paper_interactions pi
			INNER JOIN papers p ON pi.paper_id = p.id
			INNER JOIN users u ON p.author_id = u.id
			INNER JOIN categories c ON p.category_id = c.id
			WHERE pi.user_id = $1 AND pi.interaction_type IN ('comment', 'save')
			
			ORDER BY created_at DESC
			LIMIT $2
		`;

		const result = await db.query(query, [userId, limit]);
		return result.rows;
	}
}
