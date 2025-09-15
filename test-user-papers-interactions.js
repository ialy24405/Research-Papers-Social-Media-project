// Test user papers API to check interaction numbers
console.log("Testing user papers API...");

// Check if user is logged in
const token =
	localStorage.getItem("auth_token") || localStorage.getItem("token");
console.log("User logged in:", !!token);

if (!token) {
	console.log("❌ No token found - please log in first");
} else {
	console.log("✅ Token found, testing API call...");

	// Test getting user papers
	fetch("http://localhost:3005/api/users/me/papers", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
		.then((response) => {
			console.log("API Response Status:", response.status);
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`HTTP ${response.status}`);
			}
		})
		.then((data) => {
			console.log("✅ User papers data:", data);

			// Check interaction numbers
			data.forEach((paper, index) => {
				console.log(`Paper ${index + 1}: "${paper.name}"`);
				console.log("  - Reactions:", paper.interactions.reactions);
				console.log("  - Comments:", paper.interactions.comments);
				console.log("  - Saves:", paper.interactions.saves);
			});

			if (data.length === 0) {
				console.log("📝 No papers found for this user");
			}
		})
		.catch((error) => {
			console.error("❌ Failed to get user papers:", error);
		});
}
