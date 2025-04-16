"use client";
import React, { useEffect, useState } from "react";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import CustomerOrderTable from "@/components/ui/CustomerOrderTable";
import { orderType } from "@/lib/constants";
import Spinner from "@/components/ui/Spinner";
import { GET__customers } from "@/services/queries-csr";
import { customerType } from "@/lib/constants";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState(null);
	const [customers, setCustomers] = useState({});
	const [loadingCustomers, setLoadingCustomers] = useState(true);
	const searchParams = useSearchParams();

	const fetchAllCustomers = async () => {
		try {
			setLoadingCustomers(true);
			const customerTypeKey =
				activeTab === 0 ? customerType.SUPPLIER : customerType.BUYER;
			const { data: allCustomers, error } =
				await GET__customers.getAllCustomers({
					customer_type: customerTypeKey,
				});
			if (error) throw error;
			const customersMap = allCustomers.reduce(
				(acc, customer) => ({
					...acc,
					[customer.id]: customer,
				}),
				{}
			);
			setCustomers(customersMap);
		} catch (error) {
			console.error("Error fetching customers:", error);
		} finally {
			setLoadingCustomers(false);
		}
	};

	useEffect(() => {
		if (activeTab >= 0 && activeTab !== null) {
			fetchAllCustomers();
		}
	}, [activeTab]);

	useEffect(() => {
		const orderTypeParam = searchParams.get("orderType");
		const newActiveTab = orderTypeParam === "sale" ? 1 : 0;
		setActiveTab(newActiveTab);
	}, [searchParams]);

	const ordersTabData = [
		{
			label: "Suppliers",
			content: (
				<div className='p-4'>
					{loadingCustomers ? (
						<Spinner />
					) : (
						<CustomerOrderTable
							customers={customers}
							loadingCustomers={loadingCustomers}
							orderType={orderType.PURCHASE}
							activeTab={activeTab}
						/>
					)}
				</div>
			),
		},
		{
			label: "Buyers",
			content: (
				<div className='p-4'>
					{loadingCustomers ? (
						<Spinner />
					) : (
						<CustomerOrderTable
							customers={customers}
							loadingCustomers={loadingCustomers}
							orderType={orderType.SALE}
							activeTab={activeTab}
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
