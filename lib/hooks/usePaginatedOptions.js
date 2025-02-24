import { useCallback, useState } from "react";
import { createClient } from "@/supabase/client";

export const usePaginatedOptions = () => {
	const [pageState, setPageState] = useState({
		makes: 1,
		variants: 1,
		model_years: 1,
		garages: 1,
	});

	const supabase = createClient();
	const PAGE_SIZE = 10;

	const loadOptions = useCallback(
		async (entityType, searchQuery = "", parentId = null) => {
			try {
				const currentPage = pageState[entityType];
				if (entityType === "garages") {
					const { data, error } = await supabase
						.from("garages")
						.select("*")
						.ilike("name", `%${searchQuery}%`)
						.range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)
						.order("name", { ascending: true });

					return {
						options:
							data?.map((garage) => ({
								value: garage.id,
								label: garage.name,
							})) || [],
						hasMore: data?.length >= PAGE_SIZE,
						additional: { page: currentPage + 1 },
					};
				}

				let query = supabase
					.from(entityType)
					.select("*")
					.range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

				// Handle search/filters
				if (entityType === "model_years") {
					if (searchQuery && !isNaN(searchQuery)) {
						query = query.eq("year", parseInt(searchQuery));
					}
				} else {
					query = query.ilike("name", `%${searchQuery}%`);
				}

				// Handle parent relationships
				if (parentId) {
					const parentField = {
						variants: "make_id",
						model_years: "variant_id",
					}[entityType];
					if (parentField) query = query.eq(parentField, parentId);
				}

				// Handle ordering
				if (entityType === "model_years") {
					query = query.order("name", { ascending: false });
				} else {
					query = query.order("name", { ascending: true });
				}

				const { data, error, count } = await query;

				if (error) {
					console.error("Supabase error:", error);
					return { options: [], hasMore: false };
				}

				return {
					options:
						data?.map((item) => ({
							value: item.id,
							label: item.name,
						})) || [],
					hasMore: (data?.length || 0) >= PAGE_SIZE,
					additional: { page: currentPage + 1 },
				};
			} catch (error) {
				console.error("Error loading options:", error);
				return { options: [], hasMore: false };
			}
		},
		[supabase, pageState] // include pageState so updates are reflected
	);

	const updatePage = useCallback((entityType) => {
		setPageState((prev) => ({
			...prev,
			[entityType]: prev[entityType] + 1,
		}));
	}, []);

	return { loadOptions, updatePage };
};
