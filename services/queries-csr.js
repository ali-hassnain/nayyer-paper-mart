import { createClient } from "@/supabase/client";


export const GET__orders = async (status, userId) => {
	const supabase = await createClient();
	let query = supabase
		.from("orders")
		.select("*")
		.eq("requestor", userId)
		.order("created_at", { ascending: false }); // latest order on top

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

