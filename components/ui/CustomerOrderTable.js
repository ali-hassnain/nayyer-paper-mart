"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import TableWrapper from "@/components/ui/Table";
import AccordionWrapper from "@/components/ui/Accordian";
import { Badge } from "@/components/ui/shadcn/badge";
import Modal from "@/components/ui/Modal";
import { format } from "date-fns";
import { paperTypeConstant } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { imageUploadProcess } from "@/lib/helpers";
import { supabaseStorageBucketURL } from "@/lib/constants";
import { useAppContext } from "@/context/AppWrapper";
import { GET__orders, GET__payments } from "../../services/queries-csr";
import { customerType } from "../../lib/constants";
import { createClient } from "@/supabase/client";
import { removeUnderscores } from "@/lib/helpers";
import PaymentDetails from "@/components/ui/PaymentDetail";
import MakePaymentForm from "@/components/ui/MakePaymentForm";
import CustomerTableHeader from "@/components/ui/CustomerTableHeader";

const CustomerOrderTable = ({
	activeTab = null,
	customers,
	loadingCustomers,
	orderType,
}) => {
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [error, setError] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const [formMessage, setFormMessage] = useState(null);
	const [paymentDetailsModalOpen, setPaymentDetailsModalOpen] = useState(false);
	const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
	const [customerOrders, setCustomerOrders] = useState({});
	const [loadingOrders, setLoadingOrders] = useState({});
	const [localCustomers, setLocalCustomers] = useState(customers);

	const { user } = useAppContext();
	const userId = user.data.user.id;
	const supabase = createClient();

	const {
		control,
		handleSubmit: rhfHandleSubmit,
		reset,
		register,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		reValidateMode: "onChange",
	});

	useEffect(() => {
		setLocalCustomers(customers);
	}, [customers]);

	const fetchOrdersForCustomer = useCallback(
		async (customerId) => {
			try {
				setLoadingOrders((prev) => ({ ...prev, [customerId]: true }));
				// Fetch orders and payments in parallel
				const [
					{ orders, error: ordersError },
					{ payments, error: paymentsError },
				] = await Promise.all([
					GET__orders({ customer: customerId, orderType }),
					GET__payments({ customer: customerId }),
				]);

				if (ordersError) throw ordersError;
				if (paymentsError) throw paymentsError;
				// Merge and sort data
				const mergedData = [
					...(orders || []).map((order) => ({
						...order,
						type: "order",
						date: order.order_date,
						amount: order.total_bill,
					})),
					...(payments || []).map((payment) => ({
						...payment,
						type: "payment",
						date: payment.payment_date,
						amount: payment.amount,
						payment_mode: payment.payment_mode || "cash",
					})),
				].sort((a, b) => new Date(b.date) - new Date(a.date));
				setCustomerOrders((prev) => ({
					...prev,
					[customerId]: mergedData,
				}));
			} catch (error) {
				setError(error);
			} finally {
				setLoadingOrders((prev) => ({ ...prev, [customerId]: false }));
			}
		},
		[activeTab, orderType]
	);

	const handleAccordionChange = useCallback(
		(openedIds) => {
			openedIds.forEach((customerId) => {
				// Only fetch if not already loaded
				if (!customerOrders[customerId] && customers[customerId]) {
					fetchOrdersForCustomer(customerId);
				}
			});
		},
		[customerOrders, customers, fetchOrdersForCustomer]
	);

	const handleRowClick = (order) => {
		setSelectedPaymentOrder(order);
		setPaymentDetailsModalOpen(true);
	};

	const orderColumns = [
		{
			header: "Item",
			render: (_, row) =>
				row.type === "order" ? `${row.length}×${row.width}/${row.weight}` : "",
			className: "min-w-[100px] whitespace-nowrap",
		},
		{
			header: "Product",
			accessor: "product_name",
			render: (value, row) => (row.type === "order" ? value : ""),
			className: "min-w-[100px] whitespace-nowrap",
		},
		{
			header: "Weight/ream",
			accessor: "weight",
			render: (value, row) => {
				if (row.type !== "order") return "";
				const length = Number(row.length);
				const width = Number(row.width);
				const weight = Number(value);
				const paperType = row.paper_type?.toLowerCase();
				if (isNaN(length) || isNaN(width) || isNaN(weight)) {
					return "Invalid dimensions";
				}

				let result;

				if (paperType === "paper") {
					result = (length * width * weight) / paperTypeConstant.PAPER;
				} else if (paperType === "card") {
					result = (length * width * weight) / paperTypeConstant.CARD;
				} else {
					return "Invalid paper type";
				}
				return `${result.toFixed(2)}kg`;
			},
		},
		{
			header: "Rate",
			accessor: "rate",
			render: (value, row) => (row.type === "order" ? `PKR ${value}` : ""),
		},
		{
			header: "Quantity",
			accessor: "quantity",
			render: (value, row) => (row.type === "order" ? value : ""),
		},
		{
			header: "Debit/Credit",
			accessor: "total_bill",
			className: "min-w-[120px] whitespace-nowrap",
			render: (value, row) =>
				row.type === "order" ? (
					`PKR ${value?.toLocaleString("en-PK", {
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					})}`
				) : (
					<div>
						<p></p>
						{row.customer.customer_type === customerType.BUYER
							? "Credit"
							: "Debit"}
						: PKR{" "}
						{row.amount?.toLocaleString("en-PK", {
							minimumFractionDigits: 0,
							maximumFractionDigits: 0,
						})}
					</div>
				),
		},
		{
			header: "Labour",
			accessor: "labour_cost",
			render: (value, row) =>
				row.type === "order" && !!value ? `PKR ${value}` : "",
		},
		{
			header: "Type",
			accessor: "order_type",
			className: "min-w-[100px] whitespace-nowrap",
			render: (value, row) =>
				row.type === "order" ? (
					<Badge variant='outline' className='bg-blue-100'>
						{value.toUpperCase()}
					</Badge>
				) : (
					<Badge
						variant='outline'
						className={
							row.customer.customer_type === customerType.BUYER
								? `bg-green-300`
								: "bg-red-300"
						}
					>
						{row.customer.customer_type === customerType.BUYER
							? "RECEIVED"
							: "PAYMENT SENT"}
					</Badge>
				),
		},
		{
			header: "Payment Mode",
			render: (_, row) =>
				row.type === "payment"
					? removeUnderscores(row.payment_mode?.toUpperCase()) || ""
					: "",
		},
		{
			header: "Date",
			accessor: "order_date",
			className: "min-w-[180px] whitespace-nowrap",
			render: (value, row) =>
				format(new Date(value || row.payment_date), "PPpp"),
		},
		// {
		// 	header: "Total Balance",
		// 	accessor: "total_balance",
		// 	render: (value) => {
		// 		return value
		// 			? `PKR ${value?.toLocaleString("en-PK", {
		// 					minimumFractionDigits: 2,
		// 					maximumFractionDigits: 2,
		// 			  })}`
		// 			: "-";
		// 	},
		// },
		// {
		// 	header: "Your Balance",
		// 	accessor: "user_balance",
		// 	render: (value) => {
		// 		return value
		// 			? `PKR ${value?.toLocaleString("en-PK", {
		// 					minimumFractionDigits: 2,
		// 					maximumFractionDigits: 2,
		// 			  })}`
		// 			: "-";
		// 	},
		// },
		// {
		// 	header: "Partner Balance",
		// 	accessor: "partner_balance",
		// 	render: (value) => {
		// 		return value
		// 			? `PKR ${value?.toLocaleString("en-PK", {
		// 					minimumFractionDigits: 2,
		// 					maximumFractionDigits: 2,
		// 			  })}`
		// 			: "-";
		// 	},
		// },
		// {
		// 	header: "Partner",
		// 	render: (_, row) => {
		// 		if (row.type !== 'order') return "-";
		// 		const partner = customers[row.partner];
		// 		const partnerShare = row.partner_share;
		//
		// 		if (!partner || !partnerShare) return "";
		//
		// 		return (
		// 			<HoverCard
		// 				content={`${partner.business_name} holds ${partnerShare}% share in this transaction`}
		// 				contentClassName='min-w-[160px] text-center'
		// 			>
		// 				<Button
		// 					title={partner.business_name}
		// 					className='!bg-transparent !text-blue-600 hover:!underline !p-0 !text-sm'
		// 					actionable={true}
		// 					onClick={(e) => e.preventDefault()}
		// 				/>
		// 			</HoverCard>
		// 		);
		// 	},
		// },
	];

	const accordionItems = useMemo(() => {
		if (loadingCustomers) return [];

		return Object.values(localCustomers).map((customer) => {
			const orders = customerOrders[customer.id] || [];
			const isLoading = loadingOrders[customer.id];

			return {
				value: customer.id,
				trigger: (
					<div className='flex items-center justify-between w-full p-1 hover:bg-gray-50'>
						<h3 className='font-semibold text-xs'>{customer.business_name}</h3>
						<div className='flex items-center gap-1'>
							<div
								className='!bg-transparent underline !text-blue-500 hover:!bg-gray-100 !text-sm !px-3 !py-1 font-bold'
								onClick={(e) => {
									e.stopPropagation();
									setSelectedCustomer(customer);
									setShowPaymentModal(true);
								}}
							>
								Make Payment
							</div>
						</div>
					</div>
				),
				content: (
					<div className='p-4 bg-gray-50 border-t'>
						{isLoading ? (
							<div className='text-center py-4'>Loading orders...</div>
						) : (
							<>
								<CustomerTableHeader customer={customer} />
								<TableWrapper
									columns={orderColumns}
									data={orders}
									onRowClick={(row) => {
										handleRowClick(row);
									}}
									rowClassName={(row) =>
										row.type === "payment"
											? row.customer.customer_type === customerType.BUYER
												? "cursor-pointer bg-green-100 hover:bg-green-200"
												: "cursor-pointer bg-red-100 hover:bg-red-200"
											: ""
									}
								/>
							</>
						)}
					</div>
				),
			};
		});
	}, [localCustomers, customerOrders, loadingCustomers, loadingOrders]);

	if (error) {
		return <div className='text-red-500 p-4 text-center'>Error: {error}</div>;
	}

	const handleUploadImages = async (paymentProof) => {
		try {
			if (!paymentProof) return null;
			return await new Promise((resolve, reject) => {
				let uploadedUrl = null;
				imageUploadProcess({
					isPublicBucket: true,
					files: [paymentProof],
					userId,
					bucketName: "payment-proof-images",
					storageBucketURL: supabaseStorageBucketURL,
					onProgressUpdate: (file, progress) =>
						console.log(`${file.name}: ${progress}%`),
					onFileUploaded: (fileData) => {
						uploadedUrl = fileData.src; // Capture URL here
					},
					onCompletion: () => resolve(uploadedUrl), // Resolve with URL
					onError: (file, message) => {
						console.error(`Upload failed for ${file.name}:`, message);
						reject(new Error(`Failed to upload ${file.name}: ${message}`));
					},
				})();
			});
		} catch (error) {
			console.error("Upload error:", error);
			throw new Error("Payment proof upload failed: " + error.message);
		}
	};

	return (
		<div className='space-y-4'>
			<AccordionWrapper
				items={accordionItems}
				className='w-full'
				collapsible='true'
				type='multiple'
				onValueChange={handleAccordionChange}
			/>
			<Modal
				isOpen={showPaymentModal}
				onClose={() => {
					setShowPaymentModal(false);
					setPayloadPosting(false);
					setFormMessage(null);
					reset();
				}}
				title={`${
					selectedCustomer?.customer_type === customerType.SUPPLIER
						? "Make Payment to"
						: "Receive Payment from"
				} ${selectedCustomer?.business_name || ""}`}
				showActionButtons={false}
				content={
					<MakePaymentForm
						handleUploadImages={handleUploadImages}
						selectedCustomer={selectedCustomer}
						rhfHandleSubmit={rhfHandleSubmit}
						setPayloadPosting={setPayloadPosting}
						setFormMessage={setFormMessage}
						userId={userId}
						supabase={supabase}
						setLocalCustomers={setLocalCustomers}
						setShowPaymentModal={setShowPaymentModal}
						setSelectedCustomer={setSelectedCustomer}
						reset={reset}
						fetchOrdersForCustomer={fetchOrdersForCustomer}
						control={control}
						errors={errors}
						payloadPosting={payloadPosting}
						formMessage={formMessage}
						register={register}
					/>
				}
			/>
			{accordionItems.length === 0 && (
				<div className='text-center py-8 text-gray-500'>No orders found</div>
			)}
			<Modal
				isOpen={
					paymentDetailsModalOpen && selectedPaymentOrder.type === "payment"
				}
				onClose={() => setPaymentDetailsModalOpen(false)}
				title='Payment Details'
				content={<PaymentDetails payment={selectedPaymentOrder} />}
				showActionButtons={false}
			/>
		</div>
	);
};

export default CustomerOrderTable;
