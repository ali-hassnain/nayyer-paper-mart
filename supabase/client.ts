import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);
}

export const getSignedUrl = async (filePath, bucketName) => {
	const supabase = createClient();
	const cleanedFilePath = filePath.replace(`${bucketName}/`, "");
	const { data, error } = await supabase.storage
		.from(bucketName)
		.createSignedUrl(cleanedFilePath, 600000 * 600000);
	if (error) {
		console.error("Error generating signed URL:", error.message);
		return null;
	}
	return data.signedUrl;
};
