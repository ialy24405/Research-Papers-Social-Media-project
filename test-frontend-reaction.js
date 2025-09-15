// Test frontend reaction functionality
console.log("Testing frontend reaction functionality...");

// Check if user is logged in
const token = localStorage.getItem("token");
console.log("Token found:", !!token);
if (token) {
	console.log("Token starts with:", token.substring(0, 20) + "...");
}

// Test API call
async function testFrontendReaction() {
	try {
		console.log("Making reaction API call...");

		const response = await fetch("http://localhost:3005/api/reactions/toggle", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify({
				paperId: 1,
				reactionType: "like",
			}),
		});

		console.log("Response status:", response.status);
		console.log("Response headers:", Object.fromEntries(response.headers));

		if (response.ok) {
			const result = await response.json();
			console.log("✅ Success response:", result);
		} else {
			const error = await response.text();
			console.log("❌ Error response:", error);
		}
	} catch (error) {
		console.error("❌ Network error:", error);
	}
}

testFrontendReaction();
