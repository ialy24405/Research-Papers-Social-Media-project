const fetch = require("node-fetch");

async function testUserPapersAPI() {
	try {
		console.log("Testing /api/users/me/papers endpoint...");

		// First, let's test if we can get a token by logging in
		const loginResponse = await fetch("http://localhost:3005/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: "ialy24405@gmail.com",
				password: "Aa123456",
			}),
		});

		if (!loginResponse.ok) {
			console.error(
				"Login failed:",
				loginResponse.status,
				await loginResponse.text()
			);
			return;
		}

		const loginData = await loginResponse.json();
		console.log("Login successful, user:", loginData.user.full_name);

		// Now test the user papers endpoint
		const papersResponse = await fetch(
			"http://localhost:3005/api/users/me/papers",
			{
				headers: {
					Authorization: `Bearer ${loginData.token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!papersResponse.ok) {
			console.error(
				"Papers API failed:",
				papersResponse.status,
				await papersResponse.text()
			);
			return;
		}

		const papersData = await papersResponse.json();
		console.log("Papers API response:");
		papersData.forEach((paper) => {
			console.log({
				id: paper.id,
				name: paper.name,
				status: paper.status,
				interactions: paper.interactions,
			});
		});
	} catch (error) {
		console.error("Error:", error);
	}
}

testUserPapersAPI();
