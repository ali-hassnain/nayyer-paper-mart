import { createClient } from "@/supabase/client";


export const GET__orders = async (status, userId, userRole) => {
	const supabase = await createClient();
	let query = supabase.from("orders").select("*");
	const skipUserFilter =
		status !== null &&
		(
			(typeof status === "string" && (status === "open" || status === "rejected")) ||
			(Array.isArray(status) && status.every(s => s === "open" || s === "rejected"))
		);
	if (!skipUserFilter) {
		if (userRole === "sales") {
			query = query.eq("requestor", userId);
		} else if (userRole === "purchaser") {
			query = query.eq("quote_giver", userId);
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



