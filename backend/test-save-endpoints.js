const fetch = require("node-fetch");

async function testSaveFunctionality() {
	try {
		console.log("Testing save functionality...");

		// Test with a mock token and paper ID
		const paperId = 1;
		const mockToken = "test-token"; // This will fail auth, but we can see the endpoint is working

		console.log("\n1. Testing save paper endpoint...");
		const saveResponse = await fetch(
			`http://localhost:3005/api/papers/${paperId}/save`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${mockToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log("Save response status:", saveResponse.status);
		const saveData = await saveResponse.text();
		console.log("Save response:", saveData);

		console.log("\n2. Testing unsave paper endpoint...");
		const unsaveResponse = await fetch(
			`http://localhost:3005/api/papers/${paperId}/save`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${mockToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log("Unsave response status:", unsaveResponse.status);
		const unsaveData = await unsaveResponse.text();
		console.log("Unsave response:", unsaveData);
	} catch (error) {
		console.error("Test error:", error.message);
	}
}

testSaveFunctionality();
