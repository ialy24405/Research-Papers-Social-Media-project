import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone", // For EC2 deployment with Node.js server
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		unoptimized: true,
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
	// Configure external packages for server components
	serverExternalPackages: [],
	// Environment variables for static export
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
	},
};

export default nextConfig;
