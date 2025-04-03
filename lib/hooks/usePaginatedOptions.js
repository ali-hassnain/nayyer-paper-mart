import { useCallback, useRef, useState } from "react";
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
		},
		partners: {
			currentPage: 1,
			totalCount: 0,
			searchQuery: "",
		},
	});

	const loadOptions = useCallback(
		async (dropdownIdentifier, searchQuery = "") => {
			try {
				const dropdownState = paginationRef.current[dropdownIdentifier];
				if (searchQuery !== dropdownState.searchQuery) {
					paginationRef.current[dropdownIdentifier] = {
						currentPage: 1,
						totalCount: 0,
						searchQuery,
					};
				}

				const countQuery = await supabase
					.from("customers")
					.select("*", { count: "exact", head: true })
					.or(
						`business_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`
					);

				if (countQuery.error) throw countQuery.error;

				const totalCount = countQuery.count || 0;
				paginationRef.current[dropdownIdentifier].totalCount = totalCount;

				const { data, error } = await supabase
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
							// Add additional fields if needed for partners/customers differentiation
						})) || [],
					hasMore,
					additional: {
						page: hasMore
							? paginationRef.current[dropdownIdentifier].currentPage + 1
							: null,
						searchQuery,
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
