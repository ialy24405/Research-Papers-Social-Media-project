import { useCallback } from "react";
import { sharePaper } from "@/lib/share-utils";

/**
 * React hook for paper sharing functionality
 * @param paper - The paper data to share
 * @param options - Additional options for sharing
 */
export const useSharePaper = (
	paper?: {
		id: number;
		name: string;
		description?: string;
		authorName?: string;
	},
	options?: Parameters<typeof sharePaper>[1]
) => {
	const share = useCallback(async () => {
		if (!paper) {
			console.warn("Paper data not provided for sharing");
			return false;
		}

		return sharePaper(paper, options);
	}, [paper, options]);

	const isShareable = Boolean(paper);

	return {
		share,
		isShareable,
	};
};
