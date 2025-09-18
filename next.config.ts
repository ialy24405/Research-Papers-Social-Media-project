import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "picsum.photos",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	experimental: {
		// Configure body size limit for API routes
		serverComponentsExternalPackages: [],
	},
	// Configure API routes body size limit
	api: {
		bodyParser: {
			sizeLimit: "5mb",
		},
	},
};

export default nextConfig;
