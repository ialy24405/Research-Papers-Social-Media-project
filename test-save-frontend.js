// Test save functionality in browser console
// Copy and paste this code into your browser console when on the papers page

async function testSaveFeature() {
	console.log("🧪 Testing Save Feature");

	// Get auth token
	const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
	if (!token) {
		console.error("❌ No auth token found. Please log in first.");
		return;
	}

	console.log("✅ Auth token found");

	// Test saving a paper (paper ID 1)
	const paperId = 1;

	try {
		console.log(`📝 Testing save paper ${paperId}...`);

		const saveResponse = await fetch(
			`http://localhost:3005/api/papers/${paperId}/save`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (saveResponse.ok) {
			const saveData = await saveResponse.json();
			console.log("✅ Save successful:", saveData);

			// Test unsaving
			console.log(`📝 Testing unsave paper ${paperId}...`);

			const unsaveResponse = await fetch(
				`http://localhost:3005/api/papers/${paperId}/save`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (unsaveResponse.ok) {
				const unsaveData = await unsaveResponse.json();
				console.log("✅ Unsave successful:", unsaveData);
			} else {
				console.error("❌ Unsave failed:", await unsaveResponse.text());
			}
		} else {
			console.error("❌ Save failed:", await saveResponse.text());
		}

		// Test getting saved papers
		console.log("📝 Testing get saved papers...");

		const savedResponse = await fetch(
			"http://localhost:3005/api/users/me/saved-papers",
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (savedResponse.ok) {
			const savedData = await savedResponse.json();
			console.log("✅ Get saved papers successful:", savedData);
		} else {
			console.error("❌ Get saved papers failed:", await savedResponse.text());
		}
	} catch (error) {
		console.error("❌ Test error:", error);
	}
}

// Run the test
testSaveFeature();
