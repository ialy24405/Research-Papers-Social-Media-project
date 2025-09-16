import { getBackendUrl } from "./config";

/**
 * Downloads a PDF file from a URL using the fetch API
 * @param pdfUrl - The URL of the PDF file (can be relative or absolute)
 * @param filename - The filename to save the PDF as
 * @param options - Additional options for the download
 */
export const downloadPDF = async (
	pdfUrl: string,
	filename: string,
	options: {
		showAlert?: boolean;
		fallbackToNewTab?: boolean;
	} = {}
) => {
	const { showAlert = true, fallbackToNewTab = true } = options;

	// Normalize the URL
	const fullUrl = pdfUrl.startsWith("http") ? pdfUrl : getBackendUrl(pdfUrl);

	try {
		console.log("Starting download for:", fullUrl);

		// Fetch the PDF file
		const response = await fetch(fullUrl, {
			mode: "cors",
			credentials: "same-origin",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get("content-type");
		console.log("Content type:", contentType);

		// Convert to blob
		const blob = await response.blob();
		console.log("Blob size:", blob.size, "bytes");

		// Create download link
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = sanitizeFilename(filename);
		a.style.display = "none";

		// Trigger download
		document.body.appendChild(a);
		a.click();

		// Clean up
		setTimeout(() => {
			window.URL.revokeObjectURL(url);
			if (document.body.contains(a)) {
				document.body.removeChild(a);
			}
		}, 100);

		console.log("Download initiated successfully");
		return true;
	} catch (error) {
		console.error("Download failed:", error);

		// Check if this is a placeholder/localhost URL
		const isPlaceholder =
			fullUrl.includes("temp-") || fullUrl.includes("localhost");

		if (showAlert) {
			if (isPlaceholder) {
				alert(
					"This is a placeholder PDF file. Download is not available for demo content."
				);
			} else {
				alert("Download failed. Opening PDF in new tab instead.");
			}
		}

		// Don't open placeholder PDFs in new tab as they won't work
		if (fallbackToNewTab && !isPlaceholder) {
			window.open(fullUrl, "_blank");
		}

		return false;
	}
};

/**
 * Sanitizes a filename by replacing invalid characters with underscores
 * @param filename - The filename to sanitize
 * @returns The sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
	// Replace invalid filename characters with underscores
	return filename.replace(/[^a-z0-9.\-_]/gi, "_");
};

/**
 * Creates a download handler function for React components
 * @param pdfUrl - The URL of the PDF file
 * @param paperName - The name of the paper (used for filename)
 * @param options - Additional options
 */
export const createDownloadHandler = (
	pdfUrl: string,
	paperName: string,
	options?: Parameters<typeof downloadPDF>[2]
) => {
	return () => downloadPDF(pdfUrl, `${paperName}.pdf`, options);
};
