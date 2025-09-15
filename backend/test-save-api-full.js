const fetch = require("node-fetch");

async function testSaveAPI() {
	try {
		console.log("🔑 Step 1: Getting authentication token...");

		// Login to get a valid token
		const loginResponse = await fetch("http://localhost:3005/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: "ialy24405@gmail.com",
				password: "Aa123456", // Assuming this is the password
			}),
		});

		if (!loginResponse.ok) {
			console.error("❌ Login failed:", loginResponse.status);
			const errorText = await loginResponse.text();
			console.error("Login error:", errorText);
			return;
		}

		const loginData = await loginResponse.json();
		console.log("✅ Login successful");
		console.log("User:", loginData.user.full_name);
		const token = loginData.token;

		// Test save paper endpoint
		console.log("\n📝 Step 2: Testing save paper endpoint...");
		const paperId = 1; // Try to save paper 1

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

		console.log("Save response status:", saveResponse.status);
		const saveData = await saveResponse.text();
		console.log("Save response:", saveData);

		if (saveResponse.ok) {
			console.log("✅ Save successful!");

			// Test getting saved papers
			console.log("\n📚 Step 3: Testing get saved papers...");
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
				console.log("✅ Saved papers:", savedData);
			} else {
				console.error(
					"❌ Get saved papers failed:",
					await savedResponse.text()
				);
			}

			// Test unsave
			console.log("\n🗑️ Step 4: Testing unsave paper...");
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

			console.log("Unsave response status:", unsaveResponse.status);
			const unsaveData = await unsaveResponse.text();
			console.log("Unsave response:", unsaveData);
		}
	} catch (error) {
		console.error("❌ Test error:", error);
	}
}

testSaveAPI();
