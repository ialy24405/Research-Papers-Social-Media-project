import { db } from "../../config/db";

export interface Paper {
	id: number;
	title: string;
	description: string;
	author_id: number;
	category_id: string;
	pdf_url: string;
	ai_summary?: string;
	status: "pending" | "approved" | "rejected";
	rejection_reason?: string;
	approved_by_id?: number;
	created_at: Date;
	updated_at: Date;
	reaction_count?: number;
	comment_count?: number;
	save_count?: number;
}

export interface CreatePaperData {
	title: string;
	description: string;
	authorId: number;
	categoryId: string;
	pdfUrl: string;
}

export interface PaperWithDetails extends Paper {
	author_name: string;
	author_avatar: string;
	category_name: string;
	reaction_count: number;
	comment_count: number;
	save_count: number;
}

export interface PaperComment {
	id: number;
	user_id: number;
	user_name: string;
	user_avatar: string;
	comment_text: string;
	created_at: Date;
	parent_comment_id?: number;
	replies?: PaperComment[];
}

export class PaperModel {
	static async create(paperData: CreatePaperData): Promise<Paper> {
		const query = `
      INSERT INTO papers (title, description, author_id, category_id, pdf_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

		const values = [
			paperData.title,
			paperData.description,
			paperData.authorId,
			paperData.categoryId,
			paperData.pdfUrl,
		];

		const result = await db.query(query, values);
		return result.rows[0];
	}

	static async findAll(filters: any = {}): Promise<PaperWithDetails[]> {
		let query = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name,
        COALESCE(reactions.count, 0) as reaction_count,
        COALESCE(comments.count, 0) as comment_count,
        COALESCE(saves.count, 0) as save_count
      FROM papers p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
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
    `;

		const conditions = [];
		const values = [];
		let paramIndex = 1;

		// Add filters
		if (filters.status) {
			conditions.push(`p.status = $${paramIndex}`);
			values.push(filters.status);
			paramIndex++;
		}

		if (filters.categoryId) {
			conditions.push(`p.category_id = $${paramIndex}`);
			values.push(filters.categoryId);
			paramIndex++;
		}

		if (filters.authorId) {
			conditions.push(`p.author_id = $${paramIndex}`);
			values.push(filters.authorId);
			paramIndex++;
		}

		if (conditions.length > 0) {
			query += ` WHERE ${conditions.join(" AND ")}`;
		}

		// Add sorting
		const [sortField, sortDirection] = (
			filters.sortBy || "createdAt:desc"
		).split(":");
		const dbField =
			sortField === "createdAt" ? "p.created_at" : `p.${sortField}`;
		query += ` ORDER BY ${dbField} ${sortDirection.toUpperCase()}`;

		// Add pagination
		if (filters.limit) {
			query += ` LIMIT $${paramIndex}`;
			values.push(filters.limit);
			paramIndex++;
		}

		if (filters.offset) {
			query += ` OFFSET $${paramIndex}`;
			values.push(filters.offset);
		}

		const result = await db.query(query, values);
		return result.rows;
	}

	static async findById(id: number): Promise<PaperWithDetails | null> {
		const query = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name,
        c.description as category_description,
        COALESCE(reactions.count, 0) as reaction_count,
        COALESCE(comments.count, 0) as comment_count,
        COALESCE(saves.count, 0) as save_count
      FROM papers p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
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
      WHERE p.id = $1
    `;

		const result = await db.query(query, [id]);
		return result.rows[0] || null;
	}

	static async getComments(paperId: number): Promise<PaperComment[]> {
		const query = `
      SELECT 
        pi.id,
        pi.user_id,
        u.full_name as user_name,
        u.avatar_url as user_avatar,
        pi.comment_text,
        pi.created_at,
        pi.parent_comment_id
      FROM paper_interactions pi
      LEFT JOIN users u ON pi.user_id = u.id
      WHERE pi.paper_id = $1 AND pi.interaction_type = 'comment'
      ORDER BY pi.created_at ASC
    `;

		const result = await db.query(query, [paperId]);
		const comments = result.rows;

		// Build hierarchical structure
		const commentMap = new Map<number, PaperComment>();
		const rootComments: PaperComment[] = [];

		// First pass: create all comment objects
		comments.forEach((comment: any) => {
			comment.replies = [];
			commentMap.set(comment.id, comment);
		});

		// Second pass: build hierarchy
		comments.forEach((comment: any) => {
			if (comment.parent_comment_id) {
				const parent = commentMap.get(comment.parent_comment_id);
				if (parent) {
					parent.replies?.push(comment);
				}
			} else {
				rootComments.push(comment);
			}
		});

		return rootComments;
	}

	static async addComment(
		paperId: number,
		userId: number,
		commentText: string,
		parentCommentId?: number
	): Promise<void> {
		const query = `
      INSERT INTO paper_interactions (paper_id, user_id, interaction_type, comment_text, parent_comment_id)
      VALUES ($1, $2, 'comment', $3, $4)
    `;

		await db.query(query, [
			paperId,
			userId,
			commentText,
			parentCommentId || null,
		]);
	}

	static async validateParentComment(
		paperId: number,
		parentCommentId: number
	): Promise<boolean> {
		const query = `
      SELECT 1 FROM paper_interactions 
      WHERE id = $1 AND paper_id = $2 AND interaction_type = 'comment'
    `;

		const result = await db.query(query, [parentCommentId, paperId]);
		return result.rows.length > 0;
	}

	static async updateStatus(
		id: number,
		status: "approved" | "rejected",
		approvedById: number,
		rejectionReason?: string
	): Promise<void> {
		const query = `
      UPDATE papers 
      SET status = $1, approved_by_id = $2, rejection_reason = $3, updated_at = NOW()
      WHERE id = $4
    `;

		await db.query(query, [status, approvedById, rejectionReason, id]);
	}

	static async findByAuthor(authorId: number): Promise<Paper[]> {
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

		const result = await db.query(query, [authorId]);
		return result.rows;
	}

	static async getSavedPapers(userId: number): Promise<PaperWithDetails[]> {
		const query = `
      SELECT 
        p.*,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        c.name as category_name,
        COALESCE(reactions.count, 0) as reaction_count,
        COALESCE(comments.count, 0) as comment_count,
        COALESCE(saves.count, 0) as save_count
      FROM papers p
      INNER JOIN paper_interactions pi ON p.id = pi.paper_id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
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
      WHERE pi.user_id = $1 AND pi.interaction_type = 'save'
      ORDER BY pi.created_at DESC
    `;

		const result = await db.query(query, [userId]);
		return result.rows;
	}

	static async checkUserSave(
		paperId: number,
		userId: number
	): Promise<boolean> {
		const query = `
      SELECT 1 FROM paper_interactions 
      WHERE paper_id = $1 AND user_id = $2 AND interaction_type = 'save'
    `;

		const result = await db.query(query, [paperId, userId]);
		return result.rows.length > 0;
	}

	static async savePaper(paperId: number, userId: number): Promise<void> {
		const query = `
      INSERT INTO paper_interactions (paper_id, user_id, interaction_type)
      VALUES ($1, $2, 'save')
    `;

		await db.query(query, [paperId, userId]);
	}

	static async unsavePaper(paperId: number, userId: number): Promise<void> {
		const query = `
      DELETE FROM paper_interactions 
      WHERE paper_id = $1 AND user_id = $2 AND interaction_type = 'save'
    `;

		await db.query(query, [paperId, userId]);
	}

	static async deletePaper(paperId: number): Promise<void> {
		// Delete the paper - related data will be cascade deleted due to foreign key constraints
		const query = `DELETE FROM papers WHERE id = $1`;
		await db.query(query, [paperId]);
	}

	static async updatePdfUrl(paperId: number, pdfUrl: string): Promise<void> {
		const query = `UPDATE papers SET pdf_url = $1, updated_at = NOW() WHERE id = $2`;
		await db.query(query, [pdfUrl, paperId]);
	}
}
