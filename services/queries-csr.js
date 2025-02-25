import { createClient } from "@/supabase/client";


export const GET__orders = async (status, userId) => {
	const supabase = await createClient();
	let query = supabase.from("orders").select("*");

	// Only add the requestor filter if the status isn't "open" or "rejected" (or both)
	const skipRequestor =
		status !== null &&
		(
			(typeof status === "string" && (status === "open" || status === "rejected")) ||
			(Array.isArray(status) && status.every(s => s === "open" || s === "rejected"))
		);

	if (!skipRequestor) {
		query = query.eq("requestor", userId);
	}

	query = query.order("created_at", { ascending: false }); // latest order on top

	if (status !== null) {
		if (Array.isArray(status)) {
			query = query.in("status", status);
		} else {
			query = query.eq("status", status);
		}
	}
	const { data: orders, error } = await query;
	return { orders, error };
};


