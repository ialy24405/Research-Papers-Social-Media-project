/**
 * Share utilities for papers and content
 */

export interface ShareData {
	title: string;
	text?: string;
	url?: string;
}

/**
 * Share a paper using the Web Share API or fallback methods
 * @param paper - The paper data to share
 * @param options - Additional options for sharing
 */
export const sharePaper = async (
	paper: {
		id: number;
		name: string;
		description?: string;
		authorName?: string;
	},
	options: {
		showAlert?: boolean;
		includeAuthor?: boolean;
	} = {}
) => {
	const { showAlert = true, includeAuthor = true } = options;

	try {
		// Construct the paper URL
		const paperUrl = `${window.location.origin}/papers/${paper.id}`;

		// Create share text
		let shareText = paper.description || paper.name;
		if (includeAuthor && paper.authorName) {
			shareText += ` by ${paper.authorName}`;
		}

		const shareData: ShareData = {
			title: paper.name,
			text: shareText,
			url: paperUrl,
		};

		// Try Web Share API first (mobile and some desktop browsers)
		if (
			navigator.share &&
			navigator.canShare &&
			navigator.canShare(shareData)
		) {
			await navigator.share(shareData);
			console.log("Shared successfully via Web Share API");
			return true;
		}

		// Fallback: Copy to clipboard and show share options
		await copyToClipboard(paperUrl);

		if (showAlert) {
			alert(`Paper link copied to clipboard!\n\n${paper.name}\n${paperUrl}`);
		}

		return true;
	} catch (error) {
		console.error("Share failed:", error);

		// Final fallback: just show the URL
		if (showAlert) {
			const paperUrl = `${window.location.origin}/papers/${paper.id}`;
			alert(`Share this paper:\n${paper.name}\n${paperUrl}`);
		}

		return false;
	}
};

/**
 * Copy text to clipboard
 * @param text - The text to copy
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
	try {
		// Modern browsers
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		}

		// Fallback for older browsers
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.opacity = "0";
		textArea.style.pointerEvents = "none";

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		const successful = document.execCommand("copy");
		document.body.removeChild(textArea);

		return successful;
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
		return false;
	}
};

/**
 * Share via specific social media platforms
 */
export const shareViaPlatform = (
	paper: {
		id: number;
		name: string;
		description?: string;
		authorName?: string;
	},
	platform: "twitter" | "facebook" | "linkedin" | "email"
) => {
	const paperUrl = `${window.location.origin}/papers/${paper.id}`;
	const title = paper.name;
	const text = paper.description || title;
	const authorText = paper.authorName ? ` by ${paper.authorName}` : "";

	let shareUrl: string;

	switch (platform) {
		case "twitter":
			shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
				`${title}${authorText}`
			)}&url=${encodeURIComponent(paperUrl)}`;
			break;

		case "facebook":
			shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
				paperUrl
			)}&quote=${encodeURIComponent(`${title}${authorText}`)}`;
			break;

		case "linkedin":
			shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
				paperUrl
			)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
				text + authorText
			)}`;
			break;

		case "email":
			const subject = `Check out this paper: ${title}`;
			const body = `I thought you might find this paper interesting:\n\n${title}${authorText}\n\n${text}\n\nRead more: ${paperUrl}`;
			shareUrl = `mailto:?subject=${encodeURIComponent(
				subject
			)}&body=${encodeURIComponent(body)}`;
			break;

		default:
			throw new Error(`Unsupported platform: ${platform}`);
	}

	// Open in new window/tab
	window.open(shareUrl, "_blank", "noopener,noreferrer");
};

/**
 * React hook for paper sharing
 */
export const createShareHandler = (
	paper: {
		id: number;
		name: string;
		description?: string;
		authorName?: string;
	},
	options?: Parameters<typeof sharePaper>[1]
) => {
	return () => sharePaper(paper, options);
};
