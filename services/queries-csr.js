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
			.order("order_date", { ascending: false });

		// Add customer filter
		if (params.customer) {
			query = query.eq("customer", params.customer);
		}
		// Add order type filter
		if (params.orderType) {
			query = query.eq("order_type", params.orderType);
		}
		// Date range filter
		if (params.startDate && params.endDate) {
			query = query
				.gte("order_date", params.startDate)
				.lte("order_date", params.endDate);
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
	// Get all customers with optional sorting
	getAllCustomers: async (params = {}) => {
		try {
			let query = supabase
				.from("customers")
				.select("*")
				.order("created_at", { ascending: true });

			if (params.customer_type) {
				query = query.eq("customer_type", params.customer_type);
			}

			const { data, error } = await query;
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

	// Get multiple customers by IDs (using .in())
	getCustomersByIds: async (ids) => {
		try {
			if (!Array.isArray(ids)) {
				throw new Error("IDs must be an array");
			}

			const validIds = ids.filter(
				(id) =>
					typeof id === "string" &&
					id.match(
						/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
					)
			);

			if (validIds.length === 0) return { data: [], error: null };

			const { data, error } = await supabase
				.from("customers")
				.select("*")
				.in("id", validIds)
				.order("business_name", { ascending: true });

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

	// Search customers by name with pagination
	searchCustomers: async (searchTerm, page = 1, pageSize = 10) => {
		try {
			const from = (page - 1) * pageSize;
			const to = from + pageSize - 1;

			const { data, error, count } = await supabase
				.from("customers")
				.select("*", { count: "exact" })
				.ilike("business_name", `%${searchTerm}%`)
				.range(from, to);

			return {
				data: data || [],
				total: count || 0,
				error: error?.message || null,
			};
		} catch (error) {
			return {
				data: [],
				total: 0,
				error: error.message,
			};
		}
	},

	// Get customers with basic info for dropdowns
	getCustomersMini: async () => {
		try {
			const { data, error } = await supabase
				.from("customers")
				.select("id, business_name")
				.order("business_name", { ascending: true });

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

export const GET__payments = async (params = {}) => {
	try {
		let query = supabase
			.from("payments")
			.select(
				`
        *,
        customer:customers(customer_type)
      `
			)
			.order("payment_date", { ascending: false });

		if (params.customer) {
			query = query.eq("customer", params.customer);
		}

		if (params.startDate && params.endDate) {
			query = query
				.gte("payment_date", params.startDate)
				.lte("payment_date", params.endDate);
		}

		const { data, error } = await query;

		return error ? { payments: [], error } : { payments: data, error: null };
	} catch (error) {
		return {
			payments: [],
			error: error.message || "Failed to fetch payments",
		};
	}
};

export const LEDGER__services = {
	getPaymentsByCustomer: async (customerId) => {
		try {
			const { data, error } = await supabase
				.from("payments")
				.select(
					`
          *,
          customer:customers(customer_type)
        `
				)
				.eq("customer", customerId)
				.order("payment_date", { ascending: false });

			return {
				payments: data || [],
				error: error?.message || null,
			};
		} catch (error) {
			return {
				payments: [],
				error: error.message || "Failed to fetch payments",
			};
		}
	},

	getOrdersByCustomer: async (customerId) => {
		try {
			const { data, error } = await supabase
				.from("orders")
				.select("*")
				.eq("customer", customerId)
				.order("order_date", { ascending: false });

			return {
				orders: data || [],
				error: error?.message || null,
			};
		} catch (error) {
			return {
				orders: [],
				error: error.message || "Failed to fetch orders",
			};
		}
	},
};
