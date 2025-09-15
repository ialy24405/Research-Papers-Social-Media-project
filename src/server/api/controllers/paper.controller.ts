import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs, { stat } from "fs";
import { PaperModel, CreatePaperData } from "../models/paper.model";
import { CategoryModel } from "../models/category.model";
import { paperUploadSchema, papersQuerySchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth.middleware";
import { config } from "../../config";

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = config.upload.directory;
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "paper-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: config.upload.maxFileSize,
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are allowed"));
		}
	},
});

export class PaperController {
	static uploadMiddleware = upload.single("pdfFile");

	static async getAllPapers(req: Request, res: Response) {
		try {
			// Validate query parameters
			const { error, value } = papersQuerySchema.validate(req.query);
			if (error) {
				return res.status(400).json({ error: error.details[0].message });
			}

			console.log("Query parameters:", value);

			const papers = await PaperModel.findAll(value);

			console.log("Fetched papers:", papers);

			// Transform data for response
			const response = papers.map((paper) => ({
				id: paper.id,
				name: paper.title,
				description: paper.description,
				authorId: paper.author_id,
				authorName: paper.author_name,
				authorAvatar: paper.author_avatar,
				category: {
					id: paper.category_id,
					name: paper.category_name,
				},
				pdf_url: paper.pdf_url,
				status: paper.status,
				rejection_reason: paper.rejection_reason,
				approved_by: paper.approved_by_id,
				createdAt: paper.created_at,
				interactions: {
					reactions: paper.reaction_count,
					comments: paper.comment_count,
					saves: paper.save_count,
				},
			}));

			res.status(200).json(response);
		} catch (error) {
			console.error("Get papers error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async uploadPaper(req: AuthRequest, res: Response) {
		try {
			console.log("Upload request received:");
			console.log("req.body:", req.body);
			console.log("req.file:", req.file);
			console.log("Content-Type:", req.headers["content-type"]);

			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			if (!req.file) {
				console.log("No file received in req.file");
				return res.status(400).json({ error: "PDF file is required" });
			}

			// Validate form data
			const { error, value } = paperUploadSchema.validate(req.body);
			if (error) {
				// Clean up uploaded file on validation error
				fs.unlinkSync(req.file.path);
				return res.status(400).json({ error: error.details[0].message });
			}

			const { title, description, categoryId } = value;

			// Verify category exists
			const category = await CategoryModel.findById(categoryId);
			if (!category) {
				// Clean up uploaded file
				fs.unlinkSync(req.file.path);
				return res.status(400).json({ error: "Invalid category" });
			}

			// Create paper data
			const paperData: CreatePaperData = {
				title,
				description,
				authorId: req.user.id,
				categoryId,
				pdfUrl: `/uploads/${req.file.filename}`,
			};

			const paper = await PaperModel.create(paperData);

			res.status(201).json({
				message: "Paper submitted for review.",
				paper: {
					id: paper.id,
					title: paper.title,
					description: paper.description,
					categoryId: paper.category_id,
					pdfUrl: paper.pdf_url,
					status: paper.status,
					createdAt: paper.created_at,
				},
			});
		} catch (error) {
			console.error("Upload paper error:", error);

			// Clean up uploaded file on error
			if (req.file && fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}

			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async getPaperById(req: Request, res: Response) {
		try {
			const paperId = parseInt(req.params.id);

			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			const paper = await PaperModel.findById(paperId);

			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Get comments for the paper
			const comments = await PaperModel.getComments(paperId);

			const response = {
				id: paper.id,
				name: paper.title,
				description: paper.description,
				author: {
					name: paper.author_name,
					avatarUrl: paper.author_avatar,
				},
				category: {
					name: paper.category_name,
				},
				pdfUrl: paper.pdf_url,
				aiSummary: paper.ai_summary,
				createdAt: paper.created_at,
				interactions: {
					reactions: paper.reaction_count,
					comments: paper.comment_count,
					saves: paper.save_count,
				},
				comments: comments.map((comment) => ({
					user: {
						name: comment.user_name,
						avatarUrl: comment.user_avatar,
					},
					text: comment.comment_text,
					createdAt: comment.created_at,
				})),
			};

			res.status(200).json(response);
		} catch (error) {
			console.error("Get paper by ID error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async savePaper(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const paperId = parseInt(req.params.id);
			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			// Check if paper exists
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Check if already saved
			const existingSave = await PaperModel.checkUserSave(paperId, req.user.id);
			if (existingSave) {
				return res.status(400).json({ error: "Paper already saved" });
			}

			// Save the paper
			await PaperModel.savePaper(paperId, req.user.id);

			res.status(200).json({ message: "Paper saved successfully" });
		} catch (error) {
			console.error("Save paper error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async unsavePaper(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const paperId = parseInt(req.params.id);
			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			// Check if paper exists
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Check if actually saved
			const existingSave = await PaperModel.checkUserSave(paperId, req.user.id);
			if (!existingSave) {
				return res.status(400).json({ error: "Paper not saved" });
			}

			// Unsave the paper
			await PaperModel.unsavePaper(paperId, req.user.id);

			res.status(200).json({ message: "Paper unsaved successfully" });
		} catch (error) {
			console.error("Unsave paper error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async addComment(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const paperId = parseInt(req.params.id);
			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			const { comment, parentCommentId } = req.body;
			if (
				!comment ||
				typeof comment !== "string" ||
				comment.trim().length === 0
			) {
				return res.status(400).json({ error: "Comment text is required" });
			}

			if (comment.trim().length > 1000) {
				return res
					.status(400)
					.json({ error: "Comment too long (max 1000 characters)" });
			}

			// Check if paper exists
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// If replying to a comment, validate parent comment exists
			if (parentCommentId) {
				const parentCommentIdNum = parseInt(parentCommentId);
				if (isNaN(parentCommentIdNum)) {
					return res.status(400).json({ error: "Invalid parent comment ID" });
				}

				// Check if parent comment exists and belongs to this paper
				const parentExists = await PaperModel.validateParentComment(
					paperId,
					parentCommentIdNum
				);
				if (!parentExists) {
					return res.status(400).json({ error: "Parent comment not found" });
				}

				// Add the reply
				await PaperModel.addComment(
					paperId,
					req.user.id,
					comment.trim(),
					parentCommentIdNum
				);
			} else {
				// Add the comment (top-level)
				await PaperModel.addComment(paperId, req.user.id, comment.trim());
			}

			res.status(201).json({ message: "Comment added successfully" });
		} catch (error) {
			console.error("Add comment error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async getComments(req: Request, res: Response) {
		try {
			const paperId = parseInt(req.params.id);
			if (isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			// Check if paper exists
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Get comments for the paper
			const comments = await PaperModel.getComments(paperId);

			// Recursive function to transform hierarchical comments
			const transformComment = (comment: any): any => ({
				id: comment.id,
				user: {
					id: comment.user_id,
					name: comment.user_name,
					avatarUrl: comment.user_avatar,
				},
				text: comment.comment_text,
				createdAt: comment.created_at,
				parent_comment_id: comment.parent_comment_id,
				replies: comment.replies ? comment.replies.map(transformComment) : [],
			});

			const response = comments.map(transformComment);

			res.status(200).json(response);
		} catch (error) {
			console.error("Get comments error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}

	static async deletePaper(req: AuthRequest, res: Response) {
		try {
			if (!req.user) {
				return res.status(401).json({ error: "Authentication required" });
			}

			const paperId = parseInt(req.params.id);
			if (!paperId || isNaN(paperId)) {
				return res.status(400).json({ error: "Invalid paper ID" });
			}

			// Check if the paper exists and belongs to the user
			const paper = await PaperModel.findById(paperId);
			if (!paper) {
				return res.status(404).json({ error: "Paper not found" });
			}

			// Only allow the author to delete their own paper
			if (paper.author_id !== req.user.id) {
				return res
					.status(403)
					.json({ error: "You can only delete your own papers" });
			}

			// Delete the paper
			await PaperModel.deletePaper(paperId);

			res.status(200).json({ message: "Paper deleted successfully" });
		} catch (error) {
			console.error("Delete paper error:", error);
			res.status(500).json({ error: "Internal server error" });
		}
	}
}
