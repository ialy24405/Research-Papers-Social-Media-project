import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";

// Disable Next.js body parsing to handle multipart data
export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	console.log("🧪 Simple upload test API called");

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		// Parse the multipart form data
		const form = new IncomingForm({
			maxFileSize: 5 * 1024 * 1024, // 5MB limit
			allowEmptyFiles: false,
		});

		const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) {
					console.error("❌ Form parsing error:", err);
					reject(err);
				} else {
					console.log("✅ Form parsed successfully");
					resolve([fields, files]);
				}
			});
		});

		console.log("📋 Parsed data:", {
			fields: Object.keys(fields),
			files: Object.keys(files),
		});

		// Return success with parsed data info
		res.status(200).json({
			message: "Simple upload test successful",
			fieldsReceived: Object.keys(fields),
			filesReceived: Object.keys(files),
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("❌ Simple upload test error:", error);

		res.status(500).json({
			error: "Simple upload test failed",
			details:
				process.env.NODE_ENV === "development"
					? String(error)
					: "Internal error",
		});
	}
}
