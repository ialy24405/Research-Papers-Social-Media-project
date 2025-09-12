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
}
