// Test script to verify the reactions API
const http = require("http");

function testReactionAPI() {
	console.log("Testing Reaction API...");

	// Test the public stats endpoint first
	const options = {
		hostname: "localhost",
		port: 3005,
		path: "/api/reactions/stats/1",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	const req = http.request(options, (res) => {
		console.log(`Stats API - Status: ${res.statusCode}`);
		console.log(`Headers:`, res.headers);

		let data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});

		res.on("end", () => {
			console.log("Stats Response:", data);

			// Now test the toggle endpoint (should fail without auth)
			testToggleAPI();
		});
	});

	req.on("error", (e) => {
		console.error(`Problem with stats request: ${e.message}`);
	});

	req.end();
}

function testToggleAPI() {
	const postData = JSON.stringify({
		paperId: 1,
		reactionType: "like",
	});

	const options = {
		hostname: "localhost",
		port: 3005,
		path: "/api/reactions/toggle",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(postData),
		},
	};

	const req = http.request(options, (res) => {
		console.log(`Toggle API - Status: ${res.statusCode}`);

		let data = "";
		res.on("data", (chunk) => {
			data += chunk;
		});

		res.on("end", () => {
			console.log("Toggle Response:", data);
		});
	});

	req.on("error", (e) => {
		console.error(`Problem with toggle request: ${e.message}`);
	});

	req.write(postData);
	req.end();
}

testReactionAPI();
