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
	// Configure external packages for server components
	serverExternalPackages: [],
};

export default nextConfig;
