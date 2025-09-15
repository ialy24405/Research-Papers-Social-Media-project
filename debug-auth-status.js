// Debug authentication status and save functionality
// Run this in the browser console to check auth state and test save functionality

async function debugSaveFunctionality() {
	console.log("🔍 Comprehensive Save Functionality Debug");
	console.log("=====================================");

	// Step 1: Check authentication tokens
	console.log("\n1️⃣ Checking Authentication Status...");
	const authToken = localStorage.getItem("auth_token");
	const token = localStorage.getItem("token");

	console.log("Auth tokens:", {
		auth_token: authToken ? "✅ Found" : "❌ Not found",
		token: token ? "✅ Found" : "❌ Not found",
		auth_token_length: authToken?.length || 0,
		token_length: token?.length || 0,
	});

	if (authToken) {
		console.log("auth_token preview:", authToken.substring(0, 50) + "...");
	}

	if (token) {
		console.log("token preview:", token.substring(0, 50) + "...");
	}

	const currentToken = authToken || token;

	if (!currentToken) {
		console.log("❌ NO TOKEN FOUND! You need to log in first.");
		console.log("💡 Go to /login page and log in with valid credentials.");
		return;
	}

	// Step 2: Test authentication
	console.log("\n2️⃣ Testing Authentication...");
	try {
		const authResponse = await fetch("http://localhost:3005/api/users/me", {
			headers: {
				Authorization: `Bearer ${currentToken}`,
				"Content-Type": "application/json",
			},
		});

		console.log("Auth response status:", authResponse.status);

		if (authResponse.ok) {
			const userData = await authResponse.json();
			console.log("✅ Authentication successful!");
			console.log("User:", userData);

			// Step 3: Test save functionality
			console.log("\n3️⃣ Testing Save Functionality...");
			const paperId = 1;

			// Test save
			console.log(`Attempting to save paper ${paperId}...`);
			const saveResponse = await fetch(
				`http://localhost:3005/api/papers/${paperId}/save`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${currentToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Save response status:", saveResponse.status);
			console.log("Save response headers:", {
				contentType: saveResponse.headers.get("content-type"),
				contentLength: saveResponse.headers.get("content-length"),
			});

			const saveText = await saveResponse.text();
			console.log("Save response text:", saveText);

			if (saveResponse.ok) {
				console.log("✅ Save successful!");

				// Step 4: Test getting saved papers
				console.log("\n4️⃣ Testing Get Saved Papers...");
				const savedResponse = await fetch(
					"http://localhost:3005/api/users/me/saved-papers",
					{
						headers: {
							Authorization: `Bearer ${currentToken}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (savedResponse.ok) {
					const savedData = await savedResponse.json();
					console.log("✅ Saved papers retrieved:", savedData);
				} else {
					console.error(
						"❌ Failed to get saved papers:",
						await savedResponse.text()
					);
				}
			} else {
				console.error("❌ Save failed");
				try {
					const errorData = JSON.parse(saveText);
					console.error("Error details:", errorData);
				} catch (e) {
					console.error("Raw error:", saveText);
				}
			}
		} else {
			console.error("❌ Authentication failed");
			const authError = await authResponse.text();
			console.error("Auth error:", authError);
		}
	} catch (error) {
		console.error("❌ Network error:", error);
	}
}

// Run the debug
debugSaveFunctionality();
