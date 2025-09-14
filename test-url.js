/**
 * Test file to verify URL generation
 */

import { getBackendUrl, config } from "./src/lib/config";

console.log("Testing URL generation:");
console.log("Config serverUrl:", config.api.serverUrl);
console.log("Testing path: /uploads/paper-1757854893661-160046324.pdf");
console.log(
	"Generated URL:",
	getBackendUrl("/uploads/paper-1757854893661-160046324.pdf")
);

// Test with environment variables
console.log("\nEnvironment variables:");
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("NEXT_PUBLIC_SERVER_URL:", process.env.NEXT_PUBLIC_SERVER_URL);
