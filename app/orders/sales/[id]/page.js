"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppContext } from "@/context/AppWrapper";
import { redirect } from "next/navigation";
import { GET__orders, GET__customers } from "@/services/queries-csr";
import Bounded from "@/components/wrappers/Bounded";
import TableWrapper from "@/components/ui/Table";
import Container from "@/components/wrappers/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Inbox } from "lucide-react";
import { format, startOfDay } from "date-fns";
import HoverCard from "@/components/ui/HoverCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatCurrency, getEmailPrefix } from "@/lib/helpers";

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: { class: "bg-yellow-100 text-yellow-800", label: "Pending" },
		completed: { class: "bg-emerald-100 text-emerald-800", label: "Completed" },
	};

	const { class: statusClass, label } = statusConfig[status.toLowerCase()] || {
		class: "bg-gray-100 text-gray-800",
		label: status,
	};

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
		>
			{label}
		</span>
	);
};

const UserOrders = () => {
	const { user } = useAppContext();
	const userEmail = user.data.user.email;
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [loading, setLoading] = useState(false);

	const financialSummary = useMemo(() => {
		const summary = {
			totalBalance: 0,
			partnerBreakdown: new Map(),
			dateRange: "Complete Report",
			yourBalance: 0,
		};

		if (orders.length === 0) return summary;

		orders.forEach((order) => {
			const total = order.total_balance || 0;
			summary.totalBalance += total;

			const partnerBalance = order.partner_balance;
			const yourAmount = order.user_balance;
			if (order.partner) {
				// Update partner breakdown with both total and share
				const current = summary.partnerBreakdown.get(order.partner) || {
					total: 0,
					share: 0,
				};
				current.total += total;
				current.share += partnerBalance;
				summary.partnerBreakdown.set(order.partner, current);
			}
			summary.yourBalance += yourAmount;
		});

		if (startDate && endDate) {
			const start = format(startDate, "dd MMM yyyy");
			const end = format(endDate, "dd MMM yyyy");
			summary.dateRange = `${start} - ${end}`;
		}
		return summary;
	}, [orders, startDate, endDate]);

	const fetchRelatedData = useCallback(async (orders) => {
		try {
			const customerIds = [...new Set(orders.map((o) => o.customer))];
			const partnerIds = [...new Set(orders.map((o) => o.partner))];

			const [
				{ data: customers, error: customersError },
				{ data: partners, error: partnersError },
			] = await Promise.all([
				GET__customers.getCustomersByIds(customerIds),
				GET__customers.getCustomersByIds(partnerIds),
			]);

			if (customersError) throw new Error(customersError);
			if (partnersError) throw new Error(partnersError);

			const customerMap = new Map(
				customers.map((c) => [c.id, c.business_name])
			);
			const partnerMap = new Map(partners.map((p) => [p.id, p.business_name]));

			return orders.map((order) => ({
				...order,
				customer: customerMap.get(order.customer) || "-",
				partner: partnerMap.get(order.partner) || "-",
			}));
		} catch (error) {
			throw error;
		}
	}, []);

	const fetchOrders = useCallback(async () => {
		setLoading(true);
		try {
			const params = {
				orderType: "sale",
				...(startDate && { startDate: startOfDay(startDate).toISOString() }),
				...(endDate && { endDate: startOfDay(endDate).toISOString() }),
			};

			const { orders, error } = await GET__orders(params);
			if (error) throw error;
			if (!orders.length) return setOrders([]);

			const enrichedOrders = await fetchRelatedData(orders);
			setOrders(enrichedOrders);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate, fetchRelatedData]);

	useEffect(() => {
		if (!user?.data?.user) redirect("/");
		fetchOrders();
	}, [user, fetchOrders]);

	const columns = [
		{
			header: "Item",
			accessor: "item",
			render: (_, order) => {
				const parts = [];
				if (order.length) parts.push(order.length);
				if (order.width) parts.push(order.width);
				if (order.weight) parts.push(order.weight);
				return parts.join("x") || "-";
			},
			className: "whitespace-nowrap",
			headerClassName: "sticky top-0 bg-white z-10",
		},
		{
			header: "Product",
			accessor: "product_name",
			className: "min-w-[120px] ",
		},
		{
			header: "Customer",
			accessor: "customer",
			render: (value) => (
				<span className='truncate max-w-[120px] inline-block'>{value}</span>
			),
		},
		{
			header: "Partner",
			accessor: "partner",
			render: (value) => (
				<span className='truncate max-w-[120px] inline-block'>{value}</span>
			),
		},

		{
			header: "Partner Share",
			accessor: "partner_share",
			render: (value) => (value ? `${value}%` : "-"),
			className: "text-center",
		},
		{
			header: "Your Balance",
			accessor: "user_balance",
			render: (_, order) => {
				return formatCurrency(order.user_balance.toFixed(2));
			},
			className: "text-blue-600",
		},
		{
			header: "Partner Balance",
			accessor: "partner_balance",
			render: (_, order) => {
				const partnerShare = order.partner_share || 0;
				return partnerShare !== 0
					? formatCurrency(order.partner_balance.toFixed(2))
					: "-";
			},
			className: "text-amber-600",
		},

		{ header: "Quantity", accessor: "quantity" },
		{ header: "Rate", accessor: "rate" },
		{
			header: "Total Balance",
			accessor: "total_balance",
			render: (value) => (
				<p className='text-sm text-emerald-600'>
					{formatCurrency(value?.toFixed(2))}
				</p>
			),
		},
		{
			header: "Status",
			accessor: "status",
			render: (value) => <StatusBadge status={value} />,
		},
		{
			header: "Order Date",
			accessor: "created_at",
			render: (value) => format(new Date(value), "do MMMM, yyyy h:mm a"),
			className: "min-w-[160px]",
		},
	];

	if (error)
		return <div className='p-4 text-red-600'>Error: {error.message}</div>;

	return (
		<Bounded className='b__size-md b__size-fit-to-screen'>
			<Container>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
					<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
						<DatePicker
							selected={startDate}
							onChange={(date) => setStartDate(date ? startOfDay(date) : null)}
							selectsStart
							startDate={startDate}
							endDate={endDate}
							placeholderText='Start Date'
							className='p-2 border rounded w-full sm:w-[200px] text-sm'
						/>
						<DatePicker
							selected={endDate}
							onChange={(date) => setEndDate(date ? startOfDay(date) : null)}
							selectsEnd
							startDate={startDate}
							endDate={endDate}
							minDate={startDate}
							placeholderText='End Date'
							className='p-2 border rounded w-full sm:w-[200px] text-sm'
						/>
					</div>
				</div>

				<div className='mb-6 p-4 bg-gray-50 rounded-lg border'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
						<div className='p-3 bg-white rounded border'>
							<h3 className='text-sm font-medium text-gray-500 mb-1'>
								Total Balance
							</h3>
							<p className='text-2xl font-semibold text-emerald-600'>
								{formatCurrency(financialSummary.totalBalance.toFixed(2))}
							</p>
							<p className='text-sm text-gray-500 mt-1'>
								{financialSummary.dateRange}
							</p>
							<p className='text-sm text-blue-600 mt-1'>
								Your Balance:{" "}
								{formatCurrency(financialSummary.yourBalance.toFixed(2))}
							</p>
						</div>

						<div className='p-3 bg-white rounded border'>
							<h3 className='text-sm font-medium text-gray-500 mb-2'>
								Partner Breakdown
							</h3>
							<div className='space-y-2'>
								{Array.from(financialSummary.partnerBreakdown.entries()).map(
									([partner, amount]) => {
										if (partner === "-") return;
										return (
											<HoverCard
												key={partner}
												content={
													<div className='p-2 text-sm'>
														<p className='font-medium truncate max-w-[200px] truncate'>
															{partner}:
														</p>
														<p className='text-emerald-600 mt-1'>
															{formatCurrency(amount.share.toFixed(2))}
														</p>
													</div>
												}
											>
												<div className='flex justify-between items-center hover:bg-gray-50 gap-1 p-1.5 rounded cursor-pointer'>
													<span className='text-gray-600 text-sm truncate'>
														{partner}:
													</span>
													<span className='text-sm text-emerald-600 font-medium'>
														{formatCurrency(amount.share.toFixed(2))}
													</span>
												</div>
											</HoverCard>
										);
									}
								)}
								{financialSummary.partnerBreakdown.size === 0 && (
									<p className='text-gray-500 text-sm'>
										No partner transactions
									</p>
								)}
							</div>
						</div>
					</div>
					<p className='text-sm text-gray-500 border-t pt-2 mt-2'>
						{orders.length} transactions found
					</p>
				</div>

				{loading ? (
					<div className='p-4 text-gray-500'>Loading orders...</div>
				) : orders?.length === 0 ? (
					<EmptyState
						title='No Orders Found'
						description='No orders found for the selected criteria'
						icon={<Inbox size={40} />}
					/>
				) : (
					<div className='overflow-x-auto h-[300px] md:h-[600px]'>
						<div className='relative'>
							<TableWrapper
								caption='Sales Orders'
								columns={columns}
								data={orders}
								className='min-w-[800px] sm:min-w-0 block'
							/>
						</div>
					</div>
				)}
			</Container>
		</Bounded>
	);
};

export default UserOrders;
