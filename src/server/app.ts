import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { config } from "./config";

// Ensure upload directories exist
const ensureUploadDirectories = () => {
	const baseUploadDir = config.upload.directory;
	const tempDir = path.join(baseUploadDir, 'temp');
	
	if (!fs.existsSync(baseUploadDir)) {
		fs.mkdirSync(baseUploadDir, { recursive: true });
		console.log(`📁 Created base upload directory: ${baseUploadDir}`);
	}
	
	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir, { recursive: true });
		console.log(`📁 Created temp upload directory: ${tempDir}`);
	}
};

// Initialize upload directories
ensureUploadDirectories();

// Import routes
import authRoutes from "./api/routes/auth.routes";
import paperRoutes from "./api/routes/paper.routes";
import categoryRoutes from "./api/routes/category.routes";
import userRoutes from "./api/routes/user.routes";
import adminRoutes from "./api/routes/admin.routes";
import reactionRoutes from "./api/routes/reaction.routes";

const app = express();

// Security middleware with CSP configuration to allow iframe embedding
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				"frame-ancestors": [
					"'self'",
					"http://localhost:3000",
					"http://localhost:3001",
					"http://127.0.0.1:3000",
					"http://127.0.0.1:3001",
				],
			},
		},
	})
);

// Trust proxy for nginx
app.set("trust proxy", true);

// Rate limiting (temporarily disabled for debugging)
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 100, // limit each IP to 100 requests per windowMs
// 	message: "Too many requests from this IP, please try again later.",
// 	standardHeaders: true,
// 	legacyHeaders: false,
// });
// app.use(limiter);

// CORS configuration
app.use(
	cors({
		origin: config.cors.origin,
		credentials: true,
	})
);

// Logging
if (config.nodeEnv !== "test") {
	app.use(morgan("combined"));
}

// Body parsing middleware - skip JSON parsing for upload routes
app.use((req, res, next) => {
	if (req.path.includes("/upload")) {
		return next();
	}
	express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploads with proper headers
app.use(
	"/uploads",
	(req, res, next) => {
		// Set CORS headers for file downloads
		res.header("Access-Control-Allow-Origin", config.cors.origin);
		res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);

		// Set proper content disposition for downloads
		if (req.path.endsWith(".pdf")) {
			const filename = path.basename(req.path);
			res.header("Content-Type", "application/pdf");
			res.header("Content-Disposition", `inline; filename="${filename}"`);
		}

		next();
	},
	express.static(path.join(process.cwd(), config.upload.directory))
);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// API routes (nginx already handles /api prefix)
console.log("Registering routes...");
app.use("/auth", authRoutes);
app.use("/papers", paperRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/reactions", reactionRoutes);
console.log("Routes registered!");

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error("Error:", err);

		// Multer errors
		if (err.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({ error: "File too large" });
		}

		if (err.code === "LIMIT_FILE_COUNT") {
			return res.status(400).json({ error: "Too many files" });
		}

		if (err.code === "LIMIT_UNEXPECTED_FILE") {
			return res.status(400).json({ error: "Unexpected file field" });
		}

		// JWT errors
		if (err.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}

		if (err.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token expired" });
		}

		// Database errors
		if (err.code === "23505") {
			// Unique violation
			return res.status(409).json({ error: "Resource already exists" });
		}

		if (err.code === "23503") {
			// Foreign key violation
			return res
				.status(400)
				.json({ error: "Referenced resource does not exist" });
		}

		// Default error response
		res.status(500).json({
			error:
				config.nodeEnv === "development"
					? err.message
					: "Internal server error",
		});
	}
);

export default app;

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
	const PORT = config.port;
	const server = app.listen(PORT, () => {
		console.log(`🚀 ScholarStream Backend running on port ${PORT}`);
		console.log(`📚 Environment: ${config.nodeEnv}`);
		console.log(
			`🔗 API accessible at: http://localhost:3000/api (via nginx proxy)`
		);
		console.log(`📁 Upload directory: ${config.upload.directory}`);
	});

	// Graceful shutdown
	process.on("SIGTERM", () => {
		console.log("SIGTERM received, shutting down gracefully");
		server.close(() => {
			console.log("Process terminated");
		});
	});

	process.on("SIGINT", () => {
		console.log("SIGINT received, shutting down gracefully");
		server.close(() => {
			console.log("Process terminated");
		});
	});
}
