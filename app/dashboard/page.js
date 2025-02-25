"use client";
import React, { useEffect, useState } from "react";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { useAppContext } from "@/context/AppWrapper";
import { redirect } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import {
	Quote,
	Truck,
	PackageCheck,
	MailQuestion,
	Clock9,
	ThumbsUp,
} from "lucide-react";
import QuotationCard from "@/components/ui/QuotationCard";
import EmptyState from "@/components/ui/EmptyState";
import InquiryTable from "@/components/ui/InquiryTable";
import { purchaserStatus,salesStatus,roles } from "@/lib/constants";
import { GET__orders } from "@/services/queries-csr";
import Spinner from "@/components/ui/Spinner";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const { user, profile } = useAppContext();
	const { user_metadata: userMetaData } = user?.data?.user || ``;
	const userRole = profile?.role;
	const userId = user?.data?.user?.id;

	useEffect(() => {
		if (!user?.data.user && !userMetaData) {
			redirect("/");
		}
	}, [user]);

	useEffect(() => {
		const statusParam = getStatusParam(activeTab);
		fetchOrders(statusParam);
	}, [activeTab]);

	const getStatusParam = (tabIndex) => {
		if (userRole === roles.SALES) {
			if (tabIndex === 0) return salesStatus.QUOTATION;
			if (tabIndex === 1) return purchaserStatus.APPROVED; // the ticket which is approved by the salesman should show in shipment tab
			if (tabIndex === 2) return salesStatus.DELIVERY;
		} else if (userRole === roles.PURCHASER) {
			if (tabIndex === 0)
				return [purchaserStatus.OPEN, purchaserStatus.REJECTED];
			if (tabIndex === 1) return salesStatus.QUOTATION; // the ticket which goes in quotation should show in pending of purchaser
			if (tabIndex === 2) return purchaserStatus.APPROVED;
		}
		return null;
	};

	const fetchOrders = async (status) => {
		setLoading(true);
		try {
			const { orders: ordersData, error } = await GET__orders(status, userId);
			if (error) {
				console.error("Error fetching orders:", error);
			} else {
				setOrders(ordersData);
			}
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const purchasersTabsData = [
		{
			label: "Open",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<InquiryTable
							inquiries={orders}
							status={purchaserStatus.OPEN}
							fetchOrders={fetchOrders}
							setActiveTab={setActiveTab}
						/>
					) : (
						<EmptyState
							title='No Open Inquiries'
							description='You have no open inquiries at the moment.'
							icon={<MailQuestion size={40} />}
							actionText='Refresh'
							onAction={() =>
								fetchOrders([purchaserStatus.OPEN, purchaserStatus.REJECTED])
							}
						/>
					)}
				</div>
			),
		},
		{
			label: "Pending",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<InquiryTable
							inquiries={orders}
							status={salesStatus.QUOTATION}
							fetchOrders={fetchOrders}
						/>
					) : (
						<EmptyState
							title='No Pending Inquiries'
							description='You have no pending inquiries at the moment.'
							icon={<Clock9 size={40} />}
							actionText='Refresh'
							onAction={() => fetchOrders(salesStatus.QUOTATION)}
						/>
					)}
				</div>
			),
		},
		{
			label: "Approved",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<InquiryTable
							inquiries={orders}
							status={purchaserStatus.APPROVED}
							fetchOrders={fetchOrders}
						/>
					) : (
						<EmptyState
							title='No Approved Inquiries'
							description='You have no approved inquiries at the moment.'
							icon={<ThumbsUp size={40} />}
							actionText='Refresh'
							onAction={() => fetchOrders(purchaserStatus.APPROVED)}
						/>
					)}
				</div>
			),
		},
	];
	const salesTabsData = [
		{
			label: "Quotations",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
							{orders.map((order) => (
								<QuotationCard
									key={order.id}
									quotation={order}
									status={salesStatus.QUOTATION}
									fetchOrders={fetchOrders}
									setActiveTab={setActiveTab}
								/>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center'>
							<EmptyState
								title='No Quotations'
								description='You have no quotations received at the moment.'
								icon={<Quote size={40} />}
								actionText='Refresh'
								onAction={() => fetchOrders(salesStatus.QUOTATION)}
							/>
						</div>
					)}
				</div>
			),
		},
		{
			label: "Shipment",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
							{orders.map((order) => (
								<QuotationCard
									key={order.id}
									quotation={order}
									status={salesStatus.SHIPMENT}
									fetchOrders={fetchOrders}
								/>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center'>
							<EmptyState
								title='No Shipments'
								description='You have no shipments at the moment.'
								icon={<PackageCheck size={40} />}
								actionText='Refresh'
								onAction={() => fetchOrders(purchaserStatus.APPROVED)}
							/>
						</div>
					)}
				</div>
			),
		},
		{
			label: "Delivered",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
							{orders.map((order) => (
								<QuotationCard
									key={order.id}
									quotation={order}
									status={salesStatus.DELIVERY}
									fetchOrders={fetchOrders}
								/>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center'>
							<EmptyState
								title='No Deliveries'
								description='You have no deliveries at the moment.'
								icon={<Truck size={40} />}
								actionText='Refresh'
								onAction={() => fetchOrders(salesStatus.DELIVERY)}
							/>
						</div>
					)}
				</div>
			),
		},
	];

	return (
		<>
			<Bounded className='b__auth__variant01 b__size-sm u__background-light'>
				<Container>
					{userRole === roles.SALES && (
						<div className='flex flex-row-reverse mb-4'>
							<Button title={`Create Order`} destination={"/orders/new"} />
						</div>
					)}
					<div className=' mx-auto overflow-auto'>
						<Tabs
							defaultIndex={0}
							tabs={
								userRole === roles.SALES
									? salesTabsData
									: userRole === roles.PURCHASER
									? purchasersTabsData
									: null
							}
							contentHeight='70vh'
							activeIndex={activeTab}
							setActiveIndex={setActiveTab}
						/>
					</div>
				</Container>
			</Bounded>
		</>
	);
};

export default Dashboard;
