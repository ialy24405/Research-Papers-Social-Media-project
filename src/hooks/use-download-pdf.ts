import { useCallback } from "react";
import { downloadPDF } from "@/lib/download-utils";

/**
 * React hook for PDF download functionality
 * @param pdfUrl - The URL of the PDF file
 * @param paperName - The name of the paper (used for filename)
 * @param options - Additional options for the download
 */
export const useDownloadPDF = (
	pdfUrl?: string,
	paperName?: string,
	options?: Parameters<typeof downloadPDF>[2]
) => {
	const download = useCallback(async () => {
		if (!pdfUrl || !paperName) {
			console.warn("PDF URL or paper name not provided for download");
			return false;
		}

		return downloadPDF(pdfUrl, `${paperName}.pdf`, options);
	}, [pdfUrl, paperName, options]);

	const isDownloadable = Boolean(pdfUrl && paperName);

	return {
		download,
		isDownloadable,
	};
};
