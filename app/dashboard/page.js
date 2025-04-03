"use client";
import React, { useEffect, useState } from "react";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { useAppContext } from "@/context/AppWrapper";
import { redirect, useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import { Package } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PurchaseOrderTable from "@/components/ui/PurchaseOrderTable";
import { orderType } from "@/lib/constants";
import { GET__orders } from "@/services/queries-csr";
import Spinner from "@/components/ui/Spinner";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const { user } = useAppContext();
	const userId = user?.data?.user?.id;
	const searchParams = useSearchParams();

	useEffect(() => {
		if (!userId) {
			redirect("/");
		}
		fetchOrders(orderType.PURCHASE);
	}, [user]);

	useEffect(() => {
		const orderTypeParam = searchParams.get("orderType");
		setActiveTab(orderTypeParam === "sale" ? 1 : 0);
		fetchOrders(orderTypeParam);
	}, [searchParams]);

	useEffect(() => {
		const statusParam = getStatusParam(activeTab);
		fetchOrders(statusParam);
	}, [activeTab]);

	const getStatusParam = (tabIndex) => {
		if (tabIndex === 0) return orderType.PURCHASE;
		if (tabIndex === 1) return orderType.SALE;
		return null;
	};

	const fetchOrders = async (orderType) => {
		setLoading(true);
		try {
			const { orders: ordersData, error } = await GET__orders({ orderType });
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

	const ordersTabData = [
		{
			label: "Purchase Orders",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<PurchaseOrderTable
							purchaseOrders={orders}
							fetchOrders={fetchOrders}
							setActiveTab={setActiveTab}
							activeTab={activeTab}
						/>
					) : (
						<EmptyState
							title='No Purchase Orders'
							description='You have no purchase orders at the moment.'
							icon={<Package size={40} />}
							actionText='Refresh'
							onAction={() => fetchOrders(orderType.PURCHASE)}
						/>
					)}
				</div>
			),
		},
		{
			label: "Sale Orders",
			content: (
				<div className='p-4'>
					{loading ? (
						<Spinner />
					) : orders && orders.length > 0 ? (
						<PurchaseOrderTable
							purchaseOrders={orders}
							fetchOrders={fetchOrders}
							setActiveTab={setActiveTab}
							activeTab={activeTab}
						/>
					) : (
						<EmptyState
							title='No Sale Orders'
							description='You have no sale orders at the moment.'
							icon={<Package size={40} />}
							actionText='Refresh'
							onAction={() => fetchOrders(orderType.SALE)}
						/>
					)}
				</div>
			),
		},
	];
	return (
		<>
			<Bounded className='b__auth__variant01 b__size-sm u__background-light'>
				<Container>
					<div className='flex flex-row-reverse mb-4'>
						<Button title={`Create Order`} destination={"/orders/new"} />
					</div>
					<div className=' mx-auto overflow-auto'>
						<Tabs
							defaultIndex={0}
							tabs={ordersTabData}
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
