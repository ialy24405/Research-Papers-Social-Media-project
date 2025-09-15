// Test user reaction loading from API
console.log("Testing user reaction loading...");

// First check if user is logged in
const token =
	localStorage.getItem("auth_token") || localStorage.getItem("token");
console.log("User logged in:", !!token);

if (!token) {
	console.log("❌ No token found - please log in first");
} else {
	console.log("✅ Token found, testing API call...");

	// Test getting user reaction for paper ID 1
	const paperId = 1;

	fetch(`http://localhost:3005/api/reactions/user/${paperId}`, {
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
			console.log("✅ User reaction data:", data);
			if (data.reactionType) {
				console.log(`🎉 User has reacted with: ${data.reactionType}`);
			} else {
				console.log("💭 User has not reacted to this paper");
			}
		})
		.catch((error) => {
			console.error("❌ Failed to get user reaction:", error);
		});
}
