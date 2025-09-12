import app from "./app";
import { config } from "./config";

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
	console.log(`🚀 ScholarStream Backend running on port ${PORT}`);
	console.log(`📚 Environment: ${config.nodeEnv}`);
	console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
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

export default server;
