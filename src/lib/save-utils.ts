/**
 * Save utilities for papers
 */

export interface SaveData {
	paperId: number;
	userId?: number;
	isSaved: boolean;
}

/**
 * Get current user ID from JWT token stored in localStorage
 * @returns User ID or null if not authenticated
 */
const getCurrentUserId = (): number | null => {
	try {
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");
		if (!token) return null;

		// Decode JWT token to get user ID
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;

		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);

		const payload = JSON.parse(jsonPayload);
		return payload.id || null;
	} catch (error) {
		console.error("Failed to get current user ID:", error);
		return null;
	}
};

/**
 * Check if a paper is saved by the current user (from localStorage)
 * @param paperId - The ID of the paper
 */
export const isPaperSaved = (paperId: number): boolean => {
	try {
		const currentUserId = getCurrentUserId();
		if (!currentUserId) return false;

		const storageKey = `paper_saves_${currentUserId}_${paperId}`;
		const savedData = localStorage.getItem(storageKey);
		return savedData === "true";
	} catch {
		return false;
	}
};

/**
 * Check if a paper is saved by the current user from the server
 * @param paperId - The ID of the paper
 * @returns Promise<boolean | null> - true if saved, false if not saved, null if error/not authenticated
 */
export const isPaperSavedOnServer = async (
	paperId: number
): Promise<boolean | null> => {
	try {
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");
		if (!token) return null;

		// Get all saved papers from server
		const response = await fetch(
			"http://localhost:3005/api/users/me/saved-papers",
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				"Failed to fetch saved papers:",
				response.status,
				response.statusText
			);
			return null;
		}

		const savedPapers = await response.json();
		const isSaved = savedPapers.some((paper: any) => paper.id === paperId);

		console.log("📡 Server save state check:", {
			paperId,
			isSaved,
			totalSavedPapers: savedPapers.length,
		});

		return isSaved;
	} catch (error) {
		console.error("Error checking server save state:", error);
		return null;
	}
};

/**
 * Toggle save status on a paper
 * @param paperId - The ID of the paper to save/unsave
 * @param options - Additional options
 */
export const togglePaperSave = async (
	paperId: number,
	options: {
		showAlert?: boolean;
		optimistic?: boolean;
	} = {}
) => {
	const { showAlert = false, optimistic = true } = options;

	try {
		// Get authentication token (check both possible storage keys)
		const token =
			localStorage.getItem("auth_token") || localStorage.getItem("token");

		// Debug logging
		console.log("🔄 Attempting to toggle save:", {
			paperId,
			hasToken: !!token,
			tokenPreview: token ? token.substring(0, 20) + "..." : "none",
		});

		// Check current local save status
		const localSaveState = isPaperSaved(paperId);

		// Check server save state
		console.log("🔍 Checking server save state...");
		const serverSaveState = await isPaperSavedOnServer(paperId);

		console.log("📊 Save state comparison:", {
			localSaveState,
			serverSaveState,
			statesMatch:
				serverSaveState !== null
					? localSaveState === serverSaveState
					: "unknown",
		});

		// If server state is available and different from local state, sync local to server
		if (serverSaveState !== null && localSaveState !== serverSaveState) {
			console.log("⚠️ State mismatch detected - syncing local to server state");

			const currentUserId = getCurrentUserId();
			if (currentUserId) {
				const storageKey = `paper_saves_${currentUserId}_${paperId}`;
				if (serverSaveState) {
					localStorage.setItem(storageKey, "true");
				} else {
					localStorage.removeItem(storageKey);
				}
			}

			// Dispatch event to update UI with correct state
			window.dispatchEvent(
				new CustomEvent("paperSaveChanged", {
					detail: {
						paperId,
						isSaved: serverSaveState,
						action: "sync",
					},
				})
			);

			console.log("✅ State synchronized - local now matches server");

			return {
				success: true,
				action: "sync",
				isSaved: serverSaveState,
				synced: true,
			};
		}

		// Use server state if available, otherwise fall back to local state
		const currentlySaved =
			serverSaveState !== null ? serverSaveState : localSaveState;
		const action = currentlySaved ? "unsave" : "save";
		const method = currentlySaved ? "DELETE" : "POST";

		console.log("📊 Final save action details:", {
			currentlySaved,
			action,
			method,
			usingServerState: serverSaveState !== null,
		});

		// Try to make API call to backend
		const url = `http://localhost:3005/api/papers/${paperId}/save`;
		console.log("📡 Making API call:", { url, method });

		const response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
			},
		});

		console.log("📡 API response:", {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
			contentType: response.headers.get("content-type"),
		});

		if (response.ok) {
			const result = await response.json();
			console.log("✅ API success:", result);

			// Update localStorage with user-specific key
			const currentUserId = getCurrentUserId();
			if (currentUserId) {
				const storageKey = `paper_saves_${currentUserId}_${paperId}`;
				if (action === "save") {
					localStorage.setItem(storageKey, "true");
				} else {
					localStorage.removeItem(storageKey);
				}
			}

			// Dispatch custom event to update UI
			window.dispatchEvent(
				new CustomEvent("paperSaveChanged", {
					detail: {
						paperId,
						isSaved: action === "save",
						action,
					},
				})
			);

			if (showAlert) {
				const actionText = action === "save" ? "Saved" : "Unsaved";
				alert(`${actionText} paper!`);
			}

			return {
				success: true,
				action,
				isSaved: action === "save",
			};
		} else {
			let errorData: any = {};
			try {
				errorData = await response.json();
			} catch (jsonError) {
				console.warn("Failed to parse error response as JSON:", jsonError);
				errorData = {
					error: `HTTP ${response.status}: ${response.statusText}`,
				};
			}

			console.error("❌ API error:", errorData);

			// Handle known errors
			if (response.status === 401) {
				alert("Please log in to save papers");
				return {
					success: false,
					error: "Authentication required",
				};
			}

			if (response.status === 400) {
				const message = errorData.error || "Invalid request";
				if (showAlert) {
					alert(message);
				}
				return {
					success: false,
					error: message,
				};
			}

			throw new Error(
				errorData.error || `Failed to toggle save (HTTP ${response.status})`
			);
		}
	} catch (error) {
		console.error("❌ Failed to toggle save:", error);

		// Fallback to localStorage only
		if (optimistic) {
			console.log("📱 Using localStorage fallback");

			const currentUserId = getCurrentUserId();
			if (!currentUserId) {
				console.error("❌ No user ID found for localStorage fallback");
				return {
					success: false,
					error: "Authentication required",
				};
			}

			const storageKey = `paper_saves_${currentUserId}_${paperId}`;
			const currentlySaved = localStorage.getItem(storageKey) === "true";
			const action = currentlySaved ? "unsave" : "save";

			if (action === "save") {
				localStorage.setItem(storageKey, "true");
			} else {
				localStorage.removeItem(storageKey);
			}

			// Dispatch custom event to update UI
			window.dispatchEvent(
				new CustomEvent("paperSaveChanged", {
					detail: {
						paperId,
						isSaved: action === "save",
						action,
					},
				})
			);

			if (showAlert) {
				const actionText = action === "save" ? "Saved" : "Unsaved";
				alert(`${actionText} paper (offline)!`);
			}

			return {
				success: true,
				action,
				isSaved: action === "save",
				offline: true,
			};
		}

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Subscribe to save changes for a specific paper
 * @param paperId - The paper ID to watch
 * @param callback - Function to call when save status changes
 * @returns Cleanup function
 */
export const subscribeToSaveChanges = (
	paperId: number,
	callback: (data: { isSaved: boolean; action: string }) => void
) => {
	const handleSaveChange = (event: CustomEvent) => {
		if (event.detail.paperId === paperId) {
			callback({
				isSaved: event.detail.isSaved,
				action: event.detail.action,
			});
		}
	};

	window.addEventListener(
		"paperSaveChanged",
		handleSaveChange as EventListener
	);

	return () => {
		window.removeEventListener(
			"paperSaveChanged",
			handleSaveChange as EventListener
		);
	};
};

/**
 * Get save statistics from localStorage (fallback)
 * @param paperId - The paper ID
 */
export const getSaveStats = (paperId: number) => {
	try {
		const currentUserId = getCurrentUserId();
		if (!currentUserId) {
			return {
				totalSaves: 0,
				userSaved: false,
			};
		}

		const storageKey = `paper_saves_${currentUserId}_${paperId}`;
		const userSaved = localStorage.getItem(storageKey) === "true";

		return {
			totalSaves: userSaved ? 1 : 0, // We can only know the current user's save state from localStorage
			userSaved,
		};
	} catch {
		return {
			totalSaves: 0,
			userSaved: false,
		};
	}
};
