import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from 'formidable';
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import fs from 'fs';
import path from 'path';

// Disable Next.js body parsing to handle multipart data
export const config = {
	api: {
		bodyParser: false,
	},
};

interface AuthenticatedRequest extends NextApiRequest {
	userId?: number;
}

const authenticateToken = (req: AuthenticatedRequest): boolean => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return false;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: number;
		};
		req.userId = decoded.userId;
		return true;
	} catch (error) {
		return false;
	}
};

// Helper function to sanitize filename
const sanitizeFilename = (filename: string): string => {
	return filename
		.replace(/[^a-zA-Z0-9\s\-_.]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
		.substring(0, 100); // Limit length
};

export default async function handler(
	req: AuthenticatedRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		console.log("📤 Processing file upload request...");

		// Parse the multipart form data
		const form = new IncomingForm({
			maxFileSize: 5 * 1024 * 1024, // 5MB limit for Vercel
			allowEmptyFiles: false,
		});

		const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) reject(err);
				else resolve([fields, files]);
			});
		});

		console.log("📋 Parsed form data:", { fields: Object.keys(fields), files: Object.keys(files) });

		// Extract form data (formidable v3 returns arrays)
		const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
		const description = Array.isArray(fields.description) ? fields.description[0] : (fields.description || '');
		const categoryId = Array.isArray(fields.categoryId) ? fields.categoryId[0] : fields.categoryId;
		const pdfFile = Array.isArray(files.pdfFile) ? files.pdfFile[0] : files.pdfFile;

		// Validate required fields
		if (!title || !categoryId || !pdfFile) {
			return res.status(400).json({ 
				error: "Missing required fields: title, categoryId, and pdfFile are required" 
			});
		}

		// Validate file type
		if (pdfFile.mimetype !== 'application/pdf') {
			return res.status(400).json({ 
				error: "Only PDF files are allowed" 
			});
		}

		console.log("✅ Validation passed. Creating database record...");

		// Create paper record in database first
		const paperResult = await query(
			`INSERT INTO papers (title, description, author_id, category_id, status, created_at, updated_at) 
			 VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW()) 
			 RETURNING id`,
			[title, description, req.userId, categoryId]
		);

		const paperId = paperResult.rows[0].id;
		console.log("📝 Created paper record with ID:", paperId);

		// Create organized folder structure
		// For Vercel, use the public directory for file storage
		const publicDir = path.join(process.cwd(), 'public');
		const uploadsDir = path.join(publicDir, 'uploads');
		const paperFolder = path.join(uploadsDir, `paper-${paperId}`);
		
		// Ensure directories exist
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
			console.log("📁 Created uploads directory");
		}
		if (!fs.existsSync(paperFolder)) {
			fs.mkdirSync(paperFolder, { recursive: true });
			console.log("📁 Created paper-specific directory");
		}

		// Generate sanitized filename
		const sanitizedTitle = sanitizeFilename(title);
		const finalFilename = `${sanitizedTitle}.pdf`;
		const finalPath = path.join(paperFolder, finalFilename);

		// Move file to organized location
		console.log("📦 Moving file to final location...");
		fs.copyFileSync(pdfFile.filepath, finalPath);
		
		// Clean up temporary file
		try {
			fs.unlinkSync(pdfFile.filepath);
		} catch (error) {
			console.warn("⚠️ Could not clean up temp file:", error);
		}

		// Update paper record with file path (relative to public directory)
		const relativePath = path.join('uploads', `paper-${paperId}`, finalFilename);
		await query(
			`UPDATE papers SET pdf_url = $1, updated_at = NOW() WHERE id = $2`,
			[relativePath, paperId]
		);

		console.log("🎉 Upload completed successfully!");

		res.status(200).json({
			message: "Paper uploaded successfully",
			paper: {
				id: paperId,
				title,
				description,
				pdfPath: relativePath,
				status: "pending"
			}
		});

	} catch (error) {
		console.error("❌ Upload error:", error);
		
		if (error instanceof Error) {
			if (error.message.includes('maxFileSize')) {
				return res.status(413).json({ 
					error: "File too large. Maximum size is 5MB." 
				});
			}
			if (error.message.includes('ENOSPC')) {
				return res.status(507).json({ 
					error: "Insufficient storage space. Please try again later." 
				});
			}
		}

		res.status(500).json({
			error: "Internal server error",
			details: process.env.NODE_ENV === "development" ? String(error) : undefined,
		});
	}
}
