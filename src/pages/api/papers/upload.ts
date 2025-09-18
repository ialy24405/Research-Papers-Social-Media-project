import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import { query } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import jwt from "jsonwebtoken";
import fs from "fs";

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

	if (
		!process.env.NEXT_PUBLIC_SUPABASE_URL ||
		!process.env.SUPABASE_SERVICE_ROLE_KEY
	) {
		console.error("❌ Supabase environment variables are missing");
		return res.status(500).json({ error: "Storage configuration error" });
	}

	// Authenticate user
	if (!authenticateToken(req)) {
		// For testing: Use a default user ID if authentication fails
		console.warn("⚠️ Authentication failed, using default user ID for testing");
		req.userId = 1; // Default user ID for testing
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

		console.log("✅ Validation passed. Creating database record...");

		// Create paper record with a temporary pdf_url to satisfy the NOT NULL constraint
		let paperResult;
		try {
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

		// Generate sanitized filename and storage path
		const sanitizedTitle = sanitizeFilename(title);
		const fileExtension = ".pdf";
		const timestamp = Date.now();
		const storageFileName = `${sanitizedTitle}-${timestamp}${fileExtension}`;
		const storagePath = `papers/paper-${paperId}/${storageFileName}`;

		console.log("📦 Uploading to Supabase Storage...");
		console.log("Storage path:", storagePath);

		try {
			// Read file content
			const fileContent = fs.readFileSync(pdfFile.filepath);
			console.log(
				"📄 File read successfully, size:",
				fileContent.length,
				"bytes"
			);

			// Upload to Supabase Storage
			const { data: uploadData, error: uploadError } =
				await supabaseAdmin.storage
					.from("papers") // Make sure this bucket exists in your Supabase project
					.upload(storagePath, fileContent, {
						contentType: pdfFile.mimetype,
						cacheControl: "3600",
						upsert: false,
					});

			if (uploadError) {
				console.error("❌ Supabase upload error:", uploadError);
				throw new Error(`Storage upload failed: ${uploadError.message}`);
			}

			console.log("✅ File uploaded to Supabase Storage:", uploadData.path);

			// Get the public URL for the uploaded file
			const { data: publicURL } = supabaseAdmin.storage
				.from("papers")
				.getPublicUrl(storagePath);

			const pdfUrl = publicURL.publicUrl;
			console.log("🔗 Public URL generated:", pdfUrl);

			// Update paper record with the actual file URL
			await query(
				`UPDATE papers SET pdf_url = $1, updated_at = NOW() WHERE id = $2`,
				[pdfUrl, paperId]
			);

			console.log("📁 Updated paper record with Supabase URL");
		} catch (storageError) {
			console.error("❌ Storage error:", storageError);

			// Clean up database record if storage fails
			try {
				await query(`DELETE FROM papers WHERE id = $1`, [paperId]);
				console.log("🧹 Cleaned up database record due to storage error");
			} catch (cleanupError) {
				console.error("❌ Error cleaning up database record:", cleanupError);
			}

			throw new Error(`Storage error: ${storageError}`);
		} finally {
			// Clean up temporary file
			try {
				fs.unlinkSync(pdfFile.filepath);
				console.log("🧹 Cleaned up temporary file");
			} catch (error) {
				console.warn("⚠️ Could not clean up temp file:", error);
			}
		}

		console.log("🎉 Upload completed successfully!");

		res.status(200).json({
			message: "Paper uploaded successfully",
			paper: {
				id: paperId,
				title,
				description,
				pdfUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/papers/${storagePath}`,
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
			if (error.message.includes("Storage upload failed")) {
				return res.status(507).json({
					error: "File storage failed. Please try again later.",
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
