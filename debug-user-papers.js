// Test script to check user papers API response in browser console
console.log("=== USER PAPERS INTERACTION DEBUG ===");

// Check auth token
const token =
	localStorage.getItem("auth_token") || localStorage.getItem("token");
console.log("Has auth token:", !!token);

if (!token) {
	console.log("❌ Please login first to test the API");
} else {
	console.log("🔍 Testing user papers API...");

	fetch("http://localhost:3005/api/users/me/papers", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("📊 User papers data:", data);

			if (Array.isArray(data) && data.length > 0) {
				data.forEach((paper, index) => {
					console.log(`📄 Paper ${index + 1}: "${paper.name}"`);
					console.log(`   Status: ${paper.status}`);
					console.log(`   Interactions:`, paper.interactions);
					console.log(`   - Reactions: ${paper.interactions.reactions}`);
					console.log(`   - Comments: ${paper.interactions.comments}`);
					console.log(`   - Saves: ${paper.interactions.saves}`);
					console.log("   ----");
				});
			} else {
				console.log("📋 No papers found or empty response");
			}
		})
		.catch((error) => {
			console.error("❌ API Error:", error);
		});
}
