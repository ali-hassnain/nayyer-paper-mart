"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import AuthCard from "@/components/ui/AuthCard";
import Form from "@/components/ui/Form";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { useForm } from "react-hook-form";
import { createClient } from "@/supabase/client";
import { useAppContext } from "@/context/AppWrapper";
import Button from "@/components/ui/Button";
import { usePaginatedOptions } from "@/lib/hooks/usePaginatedOptions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AddCustomerFormModal from "@/components/ui/AddCustomerFormModal";
import { orderStatus, paperTypeConstant } from "@/lib/constants";
import { calculateBalances } from "@/lib/helpers";

const CreateOrderForm = () => {
	const { user } = useAppContext();
	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isValid },
		watch,
		trigger,
		setValue,
	} = useForm({ mode: "onChange", reValidateMode: "onChange" });

	const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const [cacheBuster, setCacheBuster] = useState(Date.now());

	const { loadOptions, updatePage } = usePaginatedOptions();
	const router = useRouter();
	const supabase = createClient();

	const [partner, partnerShare, orderType] = watch([
		"partner",
		"partner_share",
		"order_type",
	]);

	useEffect(() => {
		setValue("customer", null);
		setCacheBuster(Date.now()); // Force complete reload
	}, [orderType, setValue]);

	const customerLoader = useCallback(
		async (search, _, { page } = {}) => {
			if (!orderType) return { options: [] };

			try {
				const { options, hasMore } = await loadOptions("customers", {
					searchQuery: search,
					filter: {
						column: "customer_type",
						value: orderType === "sale" ? "buyer" : "supplier",
						cacheKey: cacheBuster, // Pass cache buster to query
					},
				});

				return {
					options,
					hasMore,
					// Cache busting at response level
					_cacheKey: cacheBuster,
				};
			} catch (error) {
				console.error("Customer load error:", error);
				return { options: [] };
			}
		},
		[loadOptions, orderType, cacheBuster]
	);

	// const partnerLoader = useCallback(
	// 	(search, _, { page } = {}) => loadOptions("partners", search),
	// 	[loadOptions]
	// );

	// const partnerLoader = useCallback(
	// 	(search, _, { page } = {}) => loadOptions("partners", search),
	// 	[loadOptions]
	// );

	// useEffect(() => {
	// 	trigger("partner");
	// 	trigger("partner_share");
	// }, [partner, partnerShare, trigger]);

	// const validatePartner = (value) => {
	// 	if (partnerShare && !value?.value) {
	// 		return "Partner required when share is entered";
	// 	}
	// 	return true;
	// };
	//
	// const validatePartnerShare = (value) => {
	// 	if (partner?.value && !value) {
	// 		return "Partner share is required when partner is selected";
	// 	}
	// 	if (value && !partner?.value) {
	// 		return "Cannot have partner share without selecting a partner";
	// 	}
	// 	if (partner?.value && (value < 0 || value > 100)) {
	// 		return "Partner share must be between 0-100%";
	// 	}
	// 	return true;
	// };

	const formSchema = useMemo(
		() => [
			{
				name: "order_type",
				label: "Order Type",
				type: "select",
				width: "full",
				required: { value: true, message: "Order type is required" },
				options: [
					{ value: "purchase", label: "Purchase" },
					{ value: "sale", label: "Sale" },
				],
			},
			{
				name: "product_name",
				label: "Product Name",
				type: "text",
				width: "full",
				required: { value: true, message: "Product name is required" },
				placeholder: "Enter product name",
			},
			{
				name: "length",
				label: "Length (inch)",
				type: "number",
				width: "half",
				required: { value: true, message: "Length is required" },
				placeholder: "Enter length",
			},
			{
				name: "width",
				label: "Width (inch)",
				type: "number",
				width: "half",
				required: { value: true, message: "Width is required" },
				placeholder: "Enter width",
			},
			{
				name: "weight_per_sheet",
				label: "Weight/Sheet (g)",
				type: "number",
				width: "half",
				required: { value: true, message: "Weight per sheet is required" },
				placeholder: "Enter weight per sheet",
			},
			{
				name: "rate",
				label: "Rate/kg",
				type: "number",
				width: "half",
				required: { value: true, message: "Rate is required" },
				placeholder: "Enter rate",
			},
			{
				name: "quantity",
				label: "Quantity",
				type: "number",
				width: "half",
				required: { value: true, message: "Quantity is required" },
				placeholder: "Enter quantity",
			},
			{
				name: "labour_cost",
				label: "Labour",
				type: "number",
				width: "half",
				placeholder: "Enter Labour Cost",
			},
			{
				name: "paper_type",
				label: "Paper Type",
				type: "select",
				width: "full",
				required: { value: true, message: "Paper type is required" },
				options: [
					{ value: "paper", label: "Paper" },
					{ value: "card", label: "Card" },
				],
			},
			{
				name: "customer",
				label: "Customer",
				type: "async-paginate",
				width: "full",
				key: `customer-${orderType}-${cacheBuster}`, // Composite key
				required: { value: true, message: "Customer is required" },
				loadOptions: customerLoader,
				additional: {
					page: 1,
					orderType: watch("order_type"),
				},
				handlePagination: () => updatePage("customers"),
				validate: (value) => (!orderType ? "Select order type first" : true),
				isDisabled: !orderType,
				noOptionsMessage: ({ inputValue }) =>
					!orderType
						? "Select order type first"
						: inputValue
						? "No customers found"
						: "Type to search...",
				// AsyncPaginate specific cache control
				cacheUniq: cacheBuster,
				cacheOptions: false,
				debounceTimeout: 300,
				onMenuOpen: () => {
					// Force fresh load on menu open
					if (!watch("customer")) {
						setCacheBuster(Date.now());
					}
				},
			},
			{
				name: "order_date",
				label: "Order Date",
				type: "datetime",
				required: { value: true, message: "User Payment date is required" },
				defaultValue: new Date(),
				validate: (value) => {
					if (!value) return true;
					const selectedDate = new Date(value);
					const now = new Date();
					return selectedDate <= now || "Payment date cannot be in the future";
				},
			},
			// {
			// 	name: "partner",
			// 	label: "Partner",
			// 	type: "async-paginate",
			// 	width: "full",
			// 	required: false,
			// 	loadOptions: partnerLoader,
			// 	additional: { page: 1 },
			// 	handlePagination: () => updatePage("partners"),
			// 	validate: validatePartner,
			// },
			// {
			// 	name: "partner_share",
			// 	label: "Partner Share (%)",
			// 	type: "number",
			// 	width: "half",
			// 	required: false,
			// 	placeholder: "Enter partner share",
			// 	validate: validatePartnerShare,
			// 	min: { value: 0, message: "Must be at least 0%" },
			// 	max: { value: 100, message: "Cannot exceed 100%" },
			// 	disabled: !partner?.value,
			// },
		],
		[
			customerLoader,
			orderType,
			updatePage,
			cacheBuster,
			watch,
			// partner
		]
	);

	useEffect(() => {
		if (orderType) {
			setValue("customer", null);
		}
	}, [orderType, setValue]);

	const onSubmit = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);
		try {
			const calculatedBalances = calculateBalances({
				length: formData.length,
				width: formData.width,
				weight_per_sheet: formData.weight_per_sheet,
				rate: formData.rate,
				quantity: formData.quantity,
				paper_type: formData.paper_type,
				partnerShare: formData.partner_share,
				labour_cost: formData.labour_cost,
			});
			const payload = {
				created_by: user?.data?.user?.id,
				product_name: formData.product_name,
				length: formData.length,
				width: formData.width,
				weight: formData.weight_per_sheet,
				rate: formData.rate,
				quantity: formData.quantity,
				customer: formData.customer.value,
				order_type: formData.order_type,
				partner: formData.partner?.value || null,
				partner_share: formData.partner?.value ? formData.partner_share : null,
				paper_type: formData.paper_type,
				status: orderStatus.PENDING,
				total_bill: calculatedBalances.totalBalance,
				total_balance: calculatedBalances.totalBalance,
				partner_balance: calculatedBalances.partnerBalance,
				user_balance: calculatedBalances.userBalance,
				order_date: formData.order_date,
				labour_cost: formData.labour_cost,
			};

			const { data, error } = await supabase
				.from("orders")
				.insert([payload])
				.select();

			if (error) throw error;

			const { data: customerData, error: customerError } = await supabase
				.from("customers")
				.select("customer_balance, customer_labour_balance")
				.eq("id", formData.customer.value)
				.single();

			if (customerError) throw customerError;

			const newBalance =
				(customerData.customer_balance ?? 0) + calculatedBalances.userBalance;
			const newLabourBalance =
				(customerData.customer_labour_balance ?? 0) + formData.labour_cost;

			const { data: updateData, error: updateError } = await supabase
				.from("customers")
				.update({
					customer_balance: newBalance,
					customer_labour_balance: newLabourBalance,
				})
				.eq("id", formData.customer.value)
				.select();

			if (updateError) throw updateError;

			setFormMessage({
				type: "success",
				message: "Order created successfully!",
			});
			setTimeout(
				() => router.push(`/dashboard?orderType=${formData.order_type}`),
				500
			);
		} catch (error) {
			setFormMessage({ type: "error", message: error.message });
			toast.error("Order creation failed: " + error.message);
		} finally {
			setPayloadPosting(false);
		}
	};

	return (
		<div className='overflow-y-scroll h-[100%]'>
			<Bounded className='b__auth__variant01 b__size-sm u__background-light'>
				<Container>
					<AddCustomerFormModal
						isModalOpen={isCustomerModalOpen}
						setIsModalOpen={setIsCustomerModalOpen}
					/>
					<div className='flex flex-row-reverse mb-4'>
						<Button
							actionable={true}
							title={`Add Customer`}
							onClick={() => setIsCustomerModalOpen(true)}
						/>
					</div>
					<div className='mx-auto'>
						<AuthCard heading='Create New Order' description={null}>
							<Form
								isValid={isValid}
								formFields={formSchema}
								register={register}
								errors={errors}
								control={control}
								buttonTitle='Create Order'
								onSubmit={handleSubmit(onSubmit)}
								payloadPosting={payloadPosting}
								formMessage={formMessage}
							/>
						</AuthCard>
					</div>
				</Container>
			</Bounded>
		</div>
	);
};

export default CreateOrderForm;
