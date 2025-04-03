import { createClient } from "@/supabase/client";

const supabase = await createClient();

// export const GET__orders = async (orderType) => {
// 	const { data: orders, error } = await supabase
// 		.from("orders").select("*")
// 		.order("created_at", { ascending: false })
// 		.eq("order_type", orderType);
// 	console.log("Orders:", orders);
// 	console.log("Error:", error);
// 	return { orders, error };
// };

export const GET__selectedOrder = async (selectedOrderId) => {
	const { data: currentOrder } = await supabase
		.from("orders")
		.select("*")
		.eq("id", selectedOrderId)
		.single();
	return { currentOrder };
};

export const GET__orders = async (params = {}) => {
	try {
		let query = supabase
			.from("orders")
			.select("*")
			.order("created_at", { ascending: false });

		if (params.orderType) {
			query = query.eq("order_type", params.orderType);
		}

		// Add date range filter correctly
		if (params.startDate && params.endDate) {
			query = query
				.gte("created_at", params.startDate)
				.lte("created_at", params.endDate);
		}

		const { data, error } = await query;

		return error ? { orders: [], error } : { orders: data, error: null };
	} catch (error) {
		return {
			orders: [],
			error: error.message || "Failed to fetch orders",
		};
	}
};

export const GET__customers = {
	// Get multiple customers by IDs (using .in())
	getCustomersByIds: async (ids) => {
		try {
			// Validate UUID array
			if (!Array.isArray(ids)) {
				throw new Error("IDs must be an array");
			}

			// Filter out invalid UUIDs
			const validIds = ids.filter(
				(id) =>
					typeof id === "string" &&
					id.match(
						/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
					)
			);

			if (validIds.length === 0) {
				return { data: [], error: null };
			}

			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.in("id", validIds)
				.order("created_at", { ascending: true });

			return {
				data: data || [],
				error: error?.message || null,
			};
		} catch (error) {
			return {
				data: [],
				error: error.message,
			};
		}
	},
	// Get single customer by ID
	getCustomerById: async (id) => {
		try {
			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.eq("id", id)
				.single();

			return {
				data: data || null,
				error: error?.message || null,
			};
		} catch (error) {
			return {
				data: null,
				error: error.message,
			};
		}
	},
	// Search customers by name
	searchCustomers: async (searchTerm) => {
		try {
			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.ilike("business_name", `%${searchTerm}%`)
				.limit(10);

			return {
				data: data || [],
				error: error?.message || null,
			};
		} catch (error) {
			return {
				data: [],
				error: error.message,
			};
		}
	},
};
