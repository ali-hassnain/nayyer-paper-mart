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
	try {
		console.log("Uploading file to:", bucketName, filePath);
		// 1. Upload the file
		const { data, error: uploadError } = await supabase.storage
			.from(bucketName)
			.upload(filePath, file, {
				cacheControl: "3600",
				contentType: file.type,
				upsert: false, // Change to true if you want to overwrite existing files
			});
		if (uploadError) {
			console.error("Upload failed:", uploadError);
			throw new Error(`File upload failed: ${uploadError.message}`);
		}
		// 2. Get public URL using Supabase's method
		const { data: urlData } = supabase.storage
			.from(bucketName)
			.getPublicUrl(data.path);

		if (!urlData?.publicUrl) {
			throw new Error("Failed to generate public URL");
		}
		// 3. Return standardized response
		return {
			data: {
				...data,
				publicUrl: urlData.publicUrl,
			},
			error: null,
			url: urlData.publicUrl,
		};
	} catch (error) {
		console.error("Upload error:", error);
		return {
			data: null,
			error: error.message || "File upload failed",
			url: null,
		};
	}
}

export async function PATCH__updateOrder({ orderId, updatePayload }) {
	const { data, error } = await supabase
		.from("orders")
		.update(updatePayload)
		.eq("id", orderId)
		.select();
	return { data, error };
}

export const POST__createPayment = async (paymentData) => {
	try {
		const { data, error } = await supabase
			.from("payments")
			.insert([paymentData])
			.select("*");

		return error ? { payment: null, error } : { payment: data[0], error: null };
	} catch (error) {
		return {
			payment: null,
			error: error.message || "Failed to create payment",
		};
	}
};
