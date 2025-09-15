// Token debugging script
console.log("=== Token Debug Information ===");

// Check both possible token storage keys
const authToken = localStorage.getItem("auth_token");
const token = localStorage.getItem("token");

console.log("auth_token exists:", !!authToken);
console.log("token exists:", !!token);

if (authToken) {
	console.log("auth_token preview:", authToken.substring(0, 20) + "...");
	console.log("auth_token length:", authToken.length);
}

if (token) {
	console.log("token preview:", token.substring(0, 20) + "...");
	console.log("token length:", token.length);
}

// Test the token retrieval logic used in reaction-utils
const retrievedToken =
	localStorage.getItem("auth_token") || localStorage.getItem("token");
console.log("Retrieved token using fallback logic:", !!retrievedToken);

if (retrievedToken) {
	console.log(
		"Retrieved token preview:",
		retrievedToken.substring(0, 20) + "..."
	);

	// Test a simple API call with the token
	fetch("http://localhost:3005/api/reactions/stats/1", {
		headers: {
			Authorization: `Bearer ${retrievedToken}`,
		},
	})
		.then((response) => {
			console.log("API test response status:", response.status);
			return response.json();
		})
		.then((data) => {
			console.log("API test successful:", data);
		})
		.catch((error) => {
			console.error("API test failed:", error);
		});
} else {
	console.log("❌ No token found - user may not be logged in");
}
