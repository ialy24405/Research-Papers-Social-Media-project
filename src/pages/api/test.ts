import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	console.log("🧪 Test API called");

	const environmentInfo = {
		nodeEnv: process.env.NODE_ENV,
		hasJwtSecret: !!process.env.JWT_SECRET,
		hasPostgresUrl: !!process.env.POSTGRES_URL,
		method: req.method,
		timestamp: new Date().toISOString(),
	};

	console.log("Environment info:", environmentInfo);

	res.status(200).json({
		message: "Test API working",
		environment: environmentInfo,
	});
}
