import { useCallback, useRef } from "react";
import { createClient } from "@/supabase/client";
import { capitalizeWords } from "@/lib/helpers";

export const usePaginatedOptions = () => {
	const supabase = createClient();
	const PAGE_SIZE = 10;
	const paginationRef = useRef({
		customers: {
			currentPage: 1,
			totalCount: 0,
			searchQuery: "",
			currentFilter: null,
		},
		partners: {
			currentPage: 1,
			totalCount: 0,
			searchQuery: "",
			currentFilter: null,
		},
	});

	const loadOptions = useCallback(
		async (dropdownIdentifier, options = {}) => {
			// Maintain backward compatibility with legacy string parameter
			const searchQuery =
				typeof options === "string" ? options : options.searchQuery || "";
			const filter = typeof options === "object" ? options.filter : null;

			try {
				const dropdownState = paginationRef.current[dropdownIdentifier];
				// Reset pagination if search or filter changes
				if (
					searchQuery !== dropdownState.searchQuery ||
					JSON.stringify(filter) !== JSON.stringify(dropdownState.currentFilter)
				) {
					paginationRef.current[dropdownIdentifier] = {
						currentPage: 1,
						totalCount: 0,
						searchQuery,
						currentFilter: filter,
					};
				}
				// Base query
				let query = supabase
					.from("customers")
					.select("*", { count: "exact", head: true })
					.or(
						`business_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`
					);
				// Add filter if provided
				if (filter) {
					query = query.eq(filter.column, filter.value);
				}
				const countQuery = await query;
				if (countQuery.error) throw countQuery.error;
				const totalCount = countQuery.count || 0;
				paginationRef.current[dropdownIdentifier].totalCount = totalCount;
				// Data query
				let dataQuery = supabase
					.from("customers")
					.select("*")
					.or(
						`business_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`
					)
					.range(
						(paginationRef.current[dropdownIdentifier].currentPage - 1) *
							PAGE_SIZE,
						paginationRef.current[dropdownIdentifier].currentPage * PAGE_SIZE -
							1
					)
					.order("created_at", { ascending: false });
				// Add filter to data query if provided
				if (filter) {
					dataQuery = dataQuery.eq(filter.column, filter.value);
				}
				const { data, error } = await dataQuery;
				if (error) throw error;
				const hasMore =
					paginationRef.current[dropdownIdentifier].currentPage * PAGE_SIZE <
					totalCount;
				return {
					options:
						data?.map((item) => ({
							value: item.id,
							label: `${capitalizeWords(
								item.business_name
							)} - ${capitalizeWords(item.contact_name)}`,
						})) || [],
					hasMore,
					additional: {
						page: hasMore
							? paginationRef.current[dropdownIdentifier].currentPage + 1
							: null,
						searchQuery,
						filter, // Pass filter back to maintain state
					},
				};
			} catch (error) {
				console.error("Error loading options:", error);
				return { options: [], hasMore: false };
			}
		},
		[supabase]
	);

	const updatePage = useCallback((dropdownIdentifier) => {
		if (
			paginationRef.current[dropdownIdentifier].currentPage * PAGE_SIZE <
			paginationRef.current[dropdownIdentifier].totalCount
		) {
			paginationRef.current[dropdownIdentifier].currentPage += 1;
		}
	}, []);

	return { loadOptions, updatePage };
};
