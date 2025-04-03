import { createClient } from "@/supabase/client";
const supabase = createClient();
import { loginPageUrl, supabaseStorageBucketURL } from "@/lib/constants";

export async function POST__signOut() {
	const { error } = await supabase.auth.signOut();
	if (!error && typeof window !== "undefined") {
		window.location.href = loginPageUrl;
	}
	return error;
}

export async function POST__addCustomer(payload) {
	const { data, error } = await supabase
		.from("customers")
		.insert(payload)
		.select();
	return { data, error };
}

export async function POST__uploadFile(file, bucketName, filePath) {
	console.log("Uploading file to:", bucketName, filePath);
	const { data, error } = await supabase.storage
		.from(bucketName)
		.upload(filePath, file, {
			cacheControl: "3600",
			contentType: file.type,
		});
	const publicUrl = `${supabaseStorageBucketURL}/object/public/${bucketName}/${data.path}`;
	return { data, error, url: publicUrl };
}

export async function PATCH__updateOrder({ orderId, updatePayload }) {
	const { data, error } = await supabase
		.from("orders")
		.update(updatePayload)
		.eq("id", orderId)
		.select();
	return { data, error };
}
