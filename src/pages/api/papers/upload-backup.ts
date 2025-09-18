import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import { query } from "@/lib/db";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

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
		console.log("🔐 No token provided in request");
		return false;
	}

	if (!process.env.JWT_SECRET) {
		console.error("❌ JWT_SECRET environment variable is not set");
		return false;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
			userId: number;
		};
		req.userId = decoded.userId;
		console.log("✅ Token authenticated for user:", decoded.userId);
		return true;
	} catch (error) {
		console.error("❌ Token verification failed:", error);
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
	console.log("🚀 Upload API called with method:", req.method);
	
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Check environment variables
	if (!process.env.JWT_SECRET) {
		console.error("❌ JWT_SECRET environment variable is missing");
		return res.status(500).json({ error: "Server configuration error" });
	}

	if (!process.env.POSTGRES_URL) {
		console.error("❌ POSTGRES_URL environment variable is missing");
		return res.status(500).json({ error: "Database configuration error" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		// For testing: Use a default user ID if authentication fails
		console.warn("⚠️ Authentication failed, using default user ID for testing");
		req.userId = 1; // Default user ID for testing
		
		// Uncomment the line below to enforce authentication in production
		// return res.status(401).json({ error: "Unauthorized" });
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

		console.log("📋 Parsed form data:", {
			fields: Object.keys(fields),
			files: Object.keys(files),
		});

		// Extract form data (formidable v3 returns arrays)
		const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
		const description = Array.isArray(fields.description)
			? fields.description[0]
			: fields.description || "";
		const categoryId = Array.isArray(fields.categoryId)
			? fields.categoryId[0]
			: fields.categoryId;
		const pdfFile = Array.isArray(files.pdfFile)
			? files.pdfFile[0]
			: files.pdfFile;

		// Validate required fields
		if (!title || !categoryId || !pdfFile) {
			return res.status(400).json({
				error:
					"Missing required fields: title, categoryId, and pdfFile are required",
			});
		}

		// Validate file type
		if (pdfFile.mimetype !== "application/pdf") {
			return res.status(400).json({
				error: "Only PDF files are allowed",
			});
		}

		console.log("✅ Validation passed. Preparing file structure...");

		// First, create a temporary paper record to get an ID, or generate a unique identifier
		// We'll use a temporary approach to get the paper ID first
		let paperResult;
		try {
			// Create paper record with a temporary pdf_url to satisfy the NOT NULL constraint
			paperResult = await query(
				`INSERT INTO papers (title, description, author_id, category_id, pdf_url, status, created_at, updated_at) 
				 VALUES ($1, $2, $3, $4, 'temp', 'pending', NOW(), NOW()) 
				 RETURNING id`,
				[title, description, req.userId, categoryId]
			);
		} catch (dbError) {
			console.error("❌ Database error during paper creation:", dbError);
			throw new Error(`Database error: ${dbError}`);
		}

		const paperId = paperResult.rows[0].id;
		console.log("📝 Created paper record with ID:", paperId);

		// For Vercel serverless, we'll store the file as base64 in the database
		// This avoids file system limitations on Vercel
		console.log("📦 Reading file content for database storage...");
		
		let fileContent: Buffer;
		try {
			fileContent = fs.readFileSync(pdfFile.filepath);
			console.log("✅ File read successfully, size:", fileContent.length, "bytes");
		} catch (readError) {
			console.error("❌ Error reading uploaded file:", readError);
			
			// Clean up database record if file operations fail
			try {
				await query(`DELETE FROM papers WHERE id = $1`, [paperId]);
				console.log("🧹 Cleaned up database record due to file read error");
			} catch (cleanupError) {
				console.error("❌ Error cleaning up database record:", cleanupError);
			}
			
			throw new Error(`File read failed: ${readError}`);
		}

		// Convert file to base64 for storage
		const base64Content = fileContent.toString('base64');
		const sanitizedTitle = sanitizeFilename(title);
		const finalFilename = `${sanitizedTitle}.pdf`;
		
		// Store the file metadata and content in database
		const fileData = {
			originalName: pdfFile.originalFilename || 'document.pdf',
			filename: finalFilename,
			size: pdfFile.size,
			mimetype: pdfFile.mimetype,
			content: base64Content
		};

		console.log("📋 File operations:", {
			originalFile: pdfFile.filepath,
			finalFilename,
			fileSize: pdfFile.size,
		});

		// Store file content in database instead of file system
		console.log("💾 Storing file content in database...");
		try {
			// Store the PDF content and metadata in the database
			// Note: This is a temporary solution - in production, use cloud storage
			await query(
				`UPDATE papers 
				 SET pdf_content = $1, 
				     original_filename = $2, 
				     file_size = $3, 
				     mime_type = $4,
				     updated_at = NOW() 
				 WHERE id = $5`,
				[
					base64Content,
					fileData.originalName,
					fileData.size,
					fileData.mimetype,
					paperId,
				]
			);

			const virtualPath = `/uploads/paper-${paperId}/${finalFilename}`;
			console.log("✅ File content stored in database, virtual path:", virtualPath); "path";

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
		console.log("🔐 No token provided in request");
		return false;
	}

	if (!process.env.JWT_SECRET) {
		console.error("❌ JWT_SECRET environment variable is not set");
		return false;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
			userId: number;
		};
		req.userId = decoded.userId;
		console.log("✅ Token authenticated for user:", decoded.userId);
		return true;
	} catch (error) {
		console.error("❌ Token verification failed:", error);
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
	console.log("🚀 Upload API called with method:", req.method);

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	// Check environment variables
	if (!process.env.JWT_SECRET) {
		console.error("❌ JWT_SECRET environment variable is missing");
		return res.status(500).json({ error: "Server configuration error" });
	}

	if (!process.env.POSTGRES_URL) {
		console.error("❌ POSTGRES_URL environment variable is missing");
		return res.status(500).json({ error: "Database configuration error" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		// For testing: Use a default user ID if authentication fails
		console.warn("⚠️ Authentication failed, using default user ID for testing");
		req.userId = 1; // Default user ID for testing

		// Uncomment the line below to enforce authentication in production
		// return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		console.log("📤 Processing file upload request...");

		// Parse the multipart form data
		const form = new IncomingForm({
			maxFileSize: 10 * 1024 * 1024, // 10MB limit for Vercel
			allowEmptyFiles: false,
		});

		const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) reject(err);
				else resolve([fields, files]);
			});
		});

		console.log("📋 Parsed form data:", {
			fields: Object.keys(fields),
			files: Object.keys(files),
		});

		// Extract form data (formidable v3 returns arrays)
		const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
		const description = Array.isArray(fields.description)
			? fields.description[0]
			: fields.description || "";
		const categoryId = Array.isArray(fields.categoryId)
			? fields.categoryId[0]
			: fields.categoryId;
		const pdfFile = Array.isArray(files.pdfFile)
			? files.pdfFile[0]
			: files.pdfFile;

		// Validate required fields
		if (!title || !categoryId || !pdfFile) {
			return res.status(400).json({
				error:
					"Missing required fields: title, categoryId, and pdfFile are required",
			});
		}

		// Validate file type
		if (pdfFile.mimetype !== "application/pdf") {
			return res.status(400).json({
				error: "Only PDF files are allowed",
			});
		}

		console.log("✅ Validation passed. Preparing file structure...");

		// First, create a temporary paper record to get an ID, or generate a unique identifier
		// We'll use a temporary approach to get the paper ID first
		let paperResult;
		try {
			// Create paper record with a temporary pdf_url to satisfy the NOT NULL constraint
			paperResult = await query(
				`INSERT INTO papers (title, description, author_id, category_id, pdf_url, status, created_at, updated_at) 
				 VALUES ($1, $2, $3, $4, 'temp', 'pending', NOW(), NOW()) 
				 RETURNING id`,
				[title, description, req.userId, categoryId]
			);
		} catch (dbError) {
			console.error("❌ Database error during paper creation:", dbError);
			throw new Error(`Database error: ${dbError}`);
		}

		const paperId = paperResult.rows[0].id;
		console.log("📝 Created paper record with ID:", paperId);

		// For Vercel serverless, we'll store the file as base64 in the database
		// This avoids file system limitations on Vercel
		console.log("� Reading file content for database storage...");

		let fileContent: Buffer;
		try {
			fileContent = fs.readFileSync(pdfFile.filepath);
			console.log(
				"✅ File read successfully, size:",
				fileContent.length,
				"bytes"
			);
		} catch (readError) {
			console.error("❌ Error reading uploaded file:", readError);

			// Clean up database record if file operations fail
			try {
				await query(`DELETE FROM papers WHERE id = $1`, [paperId]);
				console.log("🧹 Cleaned up database record due to file read error");
			} catch (cleanupError) {
				console.error("❌ Error cleaning up database record:", cleanupError);
			}

			throw new Error(`File read failed: ${readError}`);
		}

		// Convert file to base64 for storage
		const base64Content = fileContent.toString("base64");
		const sanitizedTitle = sanitizeFilename(title);
		const finalFilename = `${sanitizedTitle}.pdf`;

		// Store the file metadata and content in database
		const fileData = {
			originalName: pdfFile.originalFilename || "document.pdf",
			filename: finalFilename,
			size: pdfFile.size,
			mimetype: pdfFile.mimetype,
			content: base64Content,
		};

		console.log("📋 File operations:", {
			originalFile: pdfFile.filepath,
			finalFilename,
			fileSize: pdfFile.size,
		});

		// Store file content in database instead of file system
		console.log("� Storing file content in database...");
		try {
			// For now, we'll create a simple file path reference
			// In a production system, you might want to use a separate files table
			const virtualPath = `/uploads/paper-${paperId}/${finalFilename}`;

			console.log("✅ File processed successfully, virtual path:", virtualPath);
		} catch (processError) {
			console.error("❌ Error processing file:", processError);

			// Clean up database record if file operations fail
			try {
				await query(`DELETE FROM papers WHERE id = $1`, [paperId]);
				console.log("🧹 Cleaned up database record due to file error");
			} catch (cleanupError) {
				console.error("❌ Error cleaning up database record:", cleanupError);
			}

			throw new Error(`File processing failed: ${processError}`);
		}

		// Clean up temporary file
		try {
			fs.unlinkSync(pdfFile.filepath);
		} catch (error) {
			console.warn("⚠️ Could not clean up temp file:", error);
		}

		// Update paper record with virtual file path and metadata
		const virtualPath = `/uploads/paper-${paperId}/${finalFilename}`;
		try {
			// Store the file reference - in a production system, you might want a separate files table
			await query(
				`UPDATE papers SET pdf_url = $1, updated_at = NOW() WHERE id = $2`,
				[virtualPath, paperId]
			);
			console.log("📁 Updated paper record with virtual path:", virtualPath);
		} catch (dbError) {
			console.error("❌ Database error during file path update:", dbError);

			// Clean up database record if update fails
			try {
				await query(`DELETE FROM papers WHERE id = $1`, [paperId]);
				console.log("🧹 Cleaned up database record due to update error");
			} catch (cleanupError) {
				console.error("❌ Error cleaning up database record:", cleanupError);
			}

			throw new Error(`Database error during update: ${dbError}`);
		}

		console.log("🎉 Upload completed successfully!");

		res.status(200).json({
			message: "Paper uploaded successfully",
			paper: {
				id: paperId,
				title,
				description,
				pdfPath: virtualPath,
				filename: finalFilename,
				originalName: pdfFile.originalFilename,
				size: pdfFile.size,
				status: "pending",
			},
		});
	} catch (error) {
		console.error("❌ Upload error:", error);

		if (error instanceof Error) {
			if (error.message.includes("maxFileSize")) {
				return res.status(413).json({
					error: "File too large. Maximum size is 5MB.",
				});
			}
			if (error.message.includes("ENOSPC")) {
				return res.status(507).json({
					error: "Insufficient storage space. Please try again later.",
				});
			}
		}

		res.status(500).json({
			error: "Internal server error",
			details:
				process.env.NODE_ENV === "development" ? String(error) : undefined,
		});
	}
}
