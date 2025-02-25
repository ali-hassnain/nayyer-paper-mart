import { useState } from "react";
import { getSignedUrlFromSupabaseUrl } from "@/lib/helpers";
import { useDeepCompareEffect } from "./useDeepCompareEffect";

const useSignedUrls = (imagePathsInput) => {
	const imagePaths = Array.isArray(imagePathsInput) ? imagePathsInput : [];
	const [signedUrls, setSignedUrls] = useState([]);
	const [loading, setLoading] = useState(true);

	useDeepCompareEffect(() => {
		if (imagePaths.length === 0) {
			setSignedUrls([]);
			setLoading(false);
			return;
		}

		let cancelled = false;
		const fetchUrls = async () => {
			setLoading(true);
			try {
				const urls = await Promise.all(
					imagePaths.map((img) => getSignedUrlFromSupabaseUrl(img))
				);
				if (!cancelled) {
					setSignedUrls(urls);
				}
			} catch (error) {
				console.error("❌ Error fetching signed URLs:", error);
				if (!cancelled) {
					setSignedUrls([]);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		fetchUrls();
		return () => {
			cancelled = true;
		};
	}, imagePaths);

	return { signedUrls, loading };
};

export default useSignedUrls;
