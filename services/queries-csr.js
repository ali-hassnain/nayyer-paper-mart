import { createClient } from "@/supabase/client";


export const GET__orders = async (status, userId, userRole) => {
	const supabase = await createClient();
	let query = supabase.from("orders").select("*");
	if (userRole === "purchaser") {
		query = query.eq("quote_giver", userId);
	} else {
		const skipRequestor =
			status !== null &&
			(
				(typeof status === "string" && (status === "open" || status === "rejected")) ||
				(Array.isArray(status) && status.every(s => s === "open" || s === "rejected"))
			);
		if (!skipRequestor) {
			query = query.eq("requestor", userId);
		}
	}
	query = query.order("created_at", { ascending: false });
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



