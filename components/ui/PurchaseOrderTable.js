"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import TableWrapper from "@/components/ui/Table";
import AccordionWrapper from "@/components/ui/Accordian";
import { Badge } from "@/components/ui/shadcn/badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { format } from "date-fns";
import { GET__customers } from "@/services/queries-csr";
import { orderStatus, paperTypeConstant } from "@/lib/constants";
import HoverCard from "@/components/ui/HoverCard";
import { formatCurrency } from "@/lib/helpers";
import { useForm } from "react-hook-form";
import Form from "./Form";
import { SCHEMA__PaymentFormSchema } from "@/lib/schema";
import { calculateBalances, imageUploadProcess } from "@/lib/helpers";
import { orderType, supabaseStorageBucketURL } from "@/lib/constants";
import { useAppContext } from "@/context/AppWrapper";
import { PATCH__updateOrder } from "@/services/actions";
import { GET__selectedOrder } from "@/services/queries-csr";

const PurchaseOrderTable = ({
	purchaseOrders = [],
	fetchOrders,
	activeTab = null,
}) => {
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [customers, setCustomers] = useState({});
	const [error, setError] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const [formMessage, setFormMessage] = useState(null);
	const [paymentDetailsModalOpen, setPaymentDetailsModalOpen] = useState(false);
	const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
	const { user } = useAppContext();
	const userId = user.data.user.id;

	const getOrderType = () => {
		if (activeTab === 0) return orderType.PURCHASE;
		if (activeTab === 1) return orderType.SALE;
		return null;
	};

	const {
		control,
		handleSubmit,
		reset,
		register,
		formState: { errors },
	} = useForm({
		mode: "onChange",
		reValidateMode: "onChange",
	});

	useEffect(() => {
		if (selectedOrder) {
			reset({
				user_payment_amount: selectedOrder.user_balance,
				partner_payment_amount: selectedOrder.partner_balance,
			});
		}
	}, [selectedOrder, reset]);

	const fetchCustomerData = async (orderIds) => {
		try {
			// Get unique customer and partner IDs from orders
			const allIds = [
				...new Set([
					...purchaseOrders.map((o) => o.customer),
					...purchaseOrders.map((o) => o.partner),
				]),
			];
			const { data: customers, error } = await GET__customers.getCustomersByIds(
				allIds
			);
			if (error) {
				console.error("Customer fetch error:", error);
				setError(error);
				return {};
			}
			return customers.reduce(
				(acc, customer) => ({
					...acc,
					[customer.id]: customer,
				}),
				{}
			);
		} catch (error) {
			console.error("Failed to fetch customers:", error);
			setError(error);
			return {};
		}
	};

	useEffect(() => {
		const loadData = async () => {
			if (purchaseOrders.length > 0) {
				const customersMap = await fetchCustomerData();
				setCustomers(customersMap);
			}
		};
		loadData();
	}, [purchaseOrders]);

	const handleRowClick = (order) => {
		setSelectedPaymentOrder(order);
		setPaymentDetailsModalOpen(true);
	};

	const groupedOrders = useMemo(() => {
		const groups = purchaseOrders.reduce((acc, order) => {
			const key = order.customer;
			if (!acc[key]) acc[key] = [];
			acc[key].push(order);
			return acc;
		}, {});

		return Object.entries(groups)
			.map(([customerId, orders]) => ({
				customerId,
				orders: orders.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				),
			}))
			.sort(
				(a, b) =>
					new Date(b.orders[0].created_at).getTime() -
					new Date(a.orders[0].created_at).getTime()
			);
	}, [purchaseOrders]);

	const orderColumns = [
		{
			header: "Order Date",
			accessor: "created_at",
			render: (value) => format(new Date(value), "PPpp"),
		},
		{
			header: "Status",
			accessor: "status",
			render: (value) => (
				<Badge
					className={
						value === "pending"
							? "bg-yellow-100 text-yellow-800"
							: value === "completed"
							? "bg-green-100 text-green-800"
							: "bg-gray-100 text-gray-800"
					}
				>
					{value}
				</Badge>
			),
		},
		{
			header: "Item",
			render: (_, row) => `${row.length}×${row.width}/${row.weight}`,
		},
		{ header: "Product", accessor: "product_name" },
		{
			header: "Weight/ream",
			accessor: "weight",
			render: (value, row) => {
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
				// Format to 2 decimal places and add kg
				return `${result.toFixed(2)}kg`;
			},
		},
		{ header: "Rate", accessor: "rate", render: (value) => `PKR ${value}` },
		{ header: "Quantity", accessor: "quantity" },
		{
			header: "Total Bill",
			accessor: "total_bill",
			render: (value) => {
				return value
					? `PKR ${value?.toLocaleString("en-PK", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })}`
					: "-";
			},
		},
		{
			header: "Total Balance",
			accessor: "total_balance",
			render: (value) => {
				return value
					? `PKR ${value?.toLocaleString("en-PK", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })}`
					: "-";
			},
		},
		{
			header: "Your Balance",
			accessor: "user_balance",
			render: (value) => {
				return value
					? `PKR ${value?.toLocaleString("en-PK", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })}`
					: "-";
			},
		},
		{
			header: "Partner Balance",
			accessor: "partner_balance",
			render: (value) => {
				return value
					? `PKR ${value?.toLocaleString("en-PK", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })}`
					: "-";
			},
		},
		{
			header: "Partner",
			render: (_, row) => {
				const partner = customers[row.partner];
				const partnerShare = row.partner_share;

				if (!partner || !partnerShare) return "-";

				return (
					<HoverCard
						content={`${partner.business_name} holds ${partnerShare}% share in this transaction`}
						contentClassName='min-w-[160px] text-center'
					>
						<Button
							title={partner.business_name}
							className='!bg-transparent !text-blue-600 hover:!underline !p-0 !text-sm'
							actionable={true}
							onClick={(e) => e.preventDefault()}
						/>
					</HoverCard>
				);
			},
		},
		{
			header: "Actions",
			render: (_, row) =>
				row.status === orderStatus.PENDING && (
					<Button
						title='Make Payment'
						className='!bg-transparent underline !text-blue-500 hover:!bg-gray-100 !border !border-gray-300 !text-sm !px-3 !py-1'
						actionable={true}
						onClick={(e) => {
							e.stopPropagation();
							setSelectedOrder(row);
							setShowPaymentModal(true);
						}}
					/>
				),
		},
		{
			header: "Type",
			accessor: "order_type",
			render: (value) => <Badge variant='outline'>{value.toUpperCase()}</Badge>,
		},
	];

	const accordionItems = useMemo(() => {
		return groupedOrders
			.map((group) => {
				const customer = customers[group.customerId];
				if (!customer) return null;

				const totalBalance = group.orders.reduce(
					(sum, order) => sum + order.total_balance,
					0
				);

				return {
					value: group.customerId,
					trigger: (
						<div className='flex items-center justify-between w-full p-1 hover:bg-gray-50'>
							<div className='flex items-center gap-1'>
								<h3 className='font-semibold text-xs'>
									{customer.business_name}
								</h3>
								<Badge variant='secondary'>{group.orders.length} orders</Badge>
							</div>
							<div className='flex items-center gap-1'>
								<div className='text-right'>
									<p className='text-xs text-gray-500'>Total Balance</p>
									<p className='font-medium text-green-600'>
										{formatCurrency(totalBalance)}
									</p>
									<div className={"mt-1"}>
										{totalBalance !== 0 ? (
											<Badge className='bg-yellow-100 text-yellow-800 text-xs'>
												Pending
											</Badge>
										) : (
											<Badge className='bg-green-100 text-green-800 text-xs'>
												Completed
											</Badge>
										)}
									</div>
								</div>
							</div>
						</div>
					),
					content: (
						<div className='p-4 bg-gray-50 border-t'>
							<div className='mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
								<div className='space-y-1'>
									<p className='font-medium'>Contact Information</p>
									<p>{customer.contact_name}</p>
									<p>{customer.email}</p>
									<p>{customer.business_contact}</p>
								</div>
								{group.orders.some((o) => o.partner) && (
									<div>
										<p className='font-medium'>Financial Summary</p>
										{(() => {
											const summary = group.orders.reduce(
												(acc, order) => {
													const total = order.total_balance;
													acc.total += total;

													if (order.partner && order.partner_share) {
														const partnerId = order.partner;

														// Track individual partners
														if (!acc.partners[partnerId]) {
															acc.partners[partnerId] = {
																name:
																	customers[partnerId]?.business_name ||
																	"Unknown Partner",
																balance: 0,
															};
														}
														acc.partners[partnerId].balance +=
															order.partner_balance;
														acc.user += order.user_balance;
													} else {
														acc.user += total;
													}
													return acc;
												},
												{
													total: 0,
													user: 0,
													partners: {},
												}
											);

											return (
												<div className='text-xs mt-2 space-y-1'>
													<p>
														• Total Balance:
														<span className={"font-medium text-green-600"}>
															{" "}
															{formatCurrency(summary.total)}
														</span>{" "}
													</p>
													<p>
														• Your Balance:{" "}
														<span className={"font-medium text-green-600"}>
															{" "}
															{formatCurrency(summary.user)}
														</span>
													</p>

													{Object.values(summary.partners).map(
														(partner, index) => (
															<p key={index}>
																• {partner.name} Balance:{" "}
																<span className={"font-medium text-green-600"}>
																	{formatCurrency(partner.balance)}
																</span>
															</p>
														)
													)}
												</div>
											);
										})()}
									</div>
								)}
								<div className='space-y-1'>
									<p className='font-medium'>Address</p>
									<p>{customer.address}</p>
									<p>
										{customer.city}, {customer.country}
									</p>
								</div>
							</div>
							<TableWrapper
								columns={orderColumns}
								data={group.orders}
								className='rounded-lg border'
								headerClassName='bg-gray-100 '
								rowClassName='hover:bg-gray-50 cursor-pointer'
								onRowClick={(row) => handleRowClick(row)}
							/>
						</div>
					),
				};
			})
			.filter(Boolean);
	}, [groupedOrders, customers]);

	if (error) {
		return <div className='text-red-500 p-4 text-center'>Error: {error}</div>;
	}

	const handleUploadImages = async (paymentProof) => {
		const results = {};
		if (paymentProof[0]) {
			await new Promise((resolve) => {
				imageUploadProcess({
					isPublicBucket: true,
					files: paymentProof,
					userId,
					bucketName: "payment-proof-images",
					storageBucketURL: supabaseStorageBucketURL,
					onProgressUpdate: (file, progress) =>
						console.log(`${file.name}: ${progress}%`),
					onFileUploaded: (fileData) => {
						results.payment_proof = results.payment_proof || [];
						results.payment_proof.push(fileData.src);
					},
					onCompletion: resolve,
					onError: (file, message) => toast.error(`${file.name}: ${message}`),
				})();
			});
		}
		return results;
	};

	const handlePaymentSubmit = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);

		try {
			if (!selectedOrder?.id) {
				throw new Error("No order selected");
			}
			// 1. Get fresh order data from server
			const { currentOrder, error: fetchError } = await GET__selectedOrder(
				selectedOrder.id
			);

			if (fetchError || !currentOrder) throw new Error("Order not found");

			// 2. Calculate balances from latest data
			const currentBalances = {
				totalBalance: currentOrder.total_balance,
				userBalance: currentOrder.user_balance,
				partnerBalance: currentOrder.partner_balance || 0,
			};

			// 3. Validate against current balances
			const userAmount = Number(formData.user_payment_amount);
			const partnerAmount = Number(formData.partner_payment_amount || 0);

			if (userAmount > currentBalances.userBalance) {
				throw new Error("User payment amount exceeds available balance");
			}

			if (
				currentOrder.partner &&
				partnerAmount > currentBalances.partnerBalance
			) {
				throw new Error("Partner payment amount exceeds available balance");
			}

			// 4. Parallelize image uploads
			const [userProof, partnerProof] = await Promise.all([
				formData.user_payment_proof?.length
					? handleUploadImages(formData.user_payment_proof)
					: Promise.resolve(null),
				currentOrder.partner && formData.partner_payment_proof?.length
					? handleUploadImages(formData.partner_payment_proof)
					: Promise.resolve(null),
			]);

			// 5. Create payment objects
			const newPayments = [
				{
					payment_mode: formData.user_payment_mode,
					amount: userAmount,
					proof: userProof?.payment_proof?.[0] || null,
					payment_by: "user",
					payment_date: new Date().toISOString(),
				},
				...(currentOrder.partner && partnerAmount > 0
					? [
							{
								payment_mode: formData.partner_payment_mode,
								amount: partnerAmount,
								proof: partnerProof?.payment_proof?.[0] || null,
								payment_by: "partner",
								payment_date: new Date().toISOString(),
							},
					  ]
					: []),
			];

			// 6. Calculate new balances
			const updatedBalances = {
				total_balance: Number(
					(currentBalances.totalBalance - userAmount - partnerAmount).toFixed(2)
				),
				user_balance: Number(
					(currentBalances.userBalance - userAmount).toFixed(2)
				),
				partner_balance: currentOrder.partner
					? Number((currentBalances.partnerBalance - partnerAmount).toFixed(2))
					: 0,
			};

			// 7. Prepare update payload
			const updatePayload = {
				payment_made: [...(currentOrder.payment_made || []), ...newPayments],
				...updatedBalances,
				status:
					updatedBalances.total_balance <= 0
						? orderStatus.COMPLETE
						: currentOrder.status,
			};

			// 8. Update order
			const { data, error: updateError } = await PATCH__updateOrder({
				orderId: currentOrder.id,
				updatePayload,
			});

			if (updateError) throw updateError;

			// 9. Update local state
			// setPurchaseOrders(prev => prev.map(order =>
			// 	order.id === currentOrder.id ? { ...order, ...updatePayload } : order
			// ));

			// 10. Close modal and reset
			setFormMessage({
				type: "success",
				message: "Payment added successfully!",
			});
			setTimeout(() => {
				setShowPaymentModal(false);
				setSelectedOrder(null);
				reset();
			}, 1500);
			fetchOrders(getOrderType());
		} catch (error) {
			setFormMessage({
				type: "error",
				message: error.message || "Payment processing failed",
			});
		} finally {
			setPayloadPosting(false);
		}
	};

	return (
		<div className='space-y-4'>
			<AccordionWrapper
				items={accordionItems}
				className='w-full'
				collapsible='true'
				type='multiple'
			/>
			<Modal
				isOpen={showPaymentModal}
				onClose={() => {
					setShowPaymentModal(false);
					setPayloadPosting(false);
					setFormMessage(null);
					reset();
				}}
				title={`Make Payment`}
				showActionButtons={false}
				content={
					<div className='p-4 h-96 overflow-y-scroll'>
						{selectedOrder && (
							<Form
								formFields={SCHEMA__PaymentFormSchema(
									selectedOrder.user_balance,
									selectedOrder.partner_balance
								)}
								buttonTitle='Add Payment'
								onSubmit={handleSubmit(handlePaymentSubmit)}
								register={register}
								control={control}
								errors={errors}
								sectionClassName='grid gap-4 py-4'
								sectionTitleClassName='text-sm font-medium border-b pb-2 mb-2'
								fieldWrapperClassName='grid grid-cols-4 items-center gap-4'
								labelClassName='text-sm font-medium'
								inputClassName='col-span-3'
								payloadPosting={payloadPosting}
								formMessage={formMessage}
							/>
						)}
					</div>
				}
			/>
			{accordionItems.length === 0 && (
				<div className='text-center py-8 text-gray-500'>No orders found</div>
			)}
			<Modal
				isOpen={paymentDetailsModalOpen}
				onClose={() => setPaymentDetailsModalOpen(false)}
				title='Payment Details'
				content={
					selectedPaymentOrder && (
						<div className='p-4 max-h-[70vh] overflow-y-auto'>
							<div className='grid grid-cols-1 gap-6'>
								{/* User Payments */}
								<div className='space-y-4'>
									{/* Total Balances Summary */}
									<div className='mt-6 p-4 bg-gray-50 rounded-lg'>
										<h3 className='font-semibold text-lg mb-2'>
											Current Balances
										</h3>
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<p className='font-medium '>Total Bill:</p>
												<p className={"text-sm text-emerald-600"}>
													PKR{" "}
													{selectedPaymentOrder.total_bill?.toLocaleString()}
												</p>
											</div>
											<div>
												<p className='font-medium'>Total Paid:</p>
												<p className={"text-sm text-emerald-600"}>
													PKR{" "}
													{(
														selectedPaymentOrder.total_bill -
														selectedPaymentOrder.total_balance
													)?.toLocaleString()}
												</p>
											</div>
											<div>
												<p className='font-medium'>Total Balance:</p>
												<p className={"text-sm text-emerald-600"}>
													PKR{" "}
													{selectedPaymentOrder.total_balance?.toLocaleString()}
												</p>
											</div>
											<div>
												<p className='font-medium'>Your Balance:</p>
												<p className={"text-sm text-emerald-600"}>
													PKR{" "}
													{selectedPaymentOrder.user_balance?.toLocaleString()}
												</p>
											</div>
											{selectedPaymentOrder.partner && (
												<div>
													<p className='font-medium'>Partner Balance:</p>
													<p className={"text-sm text-emerald-600"}>
														PKR{" "}
														{selectedPaymentOrder.partner_balance?.toLocaleString()}
													</p>
												</div>
											)}
										</div>
									</div>
									{selectedPaymentOrder.payment_made
										?.filter((p) => p.payment_by === "user")
										.map((payment, index) => (
											<div key={index} className='bg-gray-50 p-4 rounded-lg'>
												<p className='font-medium'>Payment #{index + 1}</p>
												<div className='space-y-1 mt-2'>
													<p>
														Amount:{" "}
														<span className={"text-sm text-emerald-600"}>
															PKR {payment.amount?.toLocaleString()}
														</span>
													</p>
													<p>Mode: {payment.payment_mode}</p>
													<p>
														Date:{" "}
														{format(new Date(payment.payment_date), "PPpp")}
													</p>
													{payment.proof && (
														<a
															href={payment.proof}
															target='_blank'
															rel='noopener noreferrer'
															className='text-blue-600 hover:underline'
														>
															View Payment Proof
														</a>
													)}
												</div>
											</div>
										))}
									{!selectedPaymentOrder.payment_made?.some(
										(p) => p.payment_by === "user"
									) && (
										<p className='text-gray-500'>No user payments recorded</p>
									)}
								</div>

								{/* Partner Payments */}
								{selectedPaymentOrder.partner && (
									<div className='space-y-4'>
										<h3 className='font-semibold text-lg border-b pb-2'>
											Partner Payments
										</h3>
										{selectedPaymentOrder.payment_made
											?.filter((p) => p.payment_by === "partner")
											.map((payment, index) => (
												<div key={index} className='bg-gray-50 p-4 rounded-lg'>
													<p className='font-medium'>Payment #{index + 1}</p>
													<div className='space-y-1 mt-2'>
														<p>
															Amount:{" "}
															<span className={"text-sm text-emerald-600"}>
																PKR {payment.amount?.toLocaleString()}
															</span>
														</p>
														<p>Mode: {payment.payment_mode}</p>
														<p>
															Date:{" "}
															{format(new Date(payment.payment_date), "PPpp")}
														</p>
														{payment.proof && (
															<a
																href={payment.proof}
																target='_blank'
																rel='noopener noreferrer'
																className='text-blue-600 hover:underline'
															>
																View Payment Proof
															</a>
														)}
													</div>
												</div>
											))}
										{!selectedPaymentOrder.payment_made?.some(
											(p) => p.payment_by === "partner"
										) && (
											<p className='text-gray-500'>
												No partner payments recorded
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					)
				}
				actionButtons={
					<Button
						title='Close'
						onClick={() => setPaymentDetailsModalOpen(false)}
						className='mt-4'
					/>
				}
			/>
		</div>
	);
};

export default PurchaseOrderTable;
