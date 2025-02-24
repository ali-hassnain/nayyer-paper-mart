"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppWrapper";
import { redirect } from "next/navigation";
import { GET__orders } from "@/services/queries-csr";
import Bounded from "@/components/wrappers/Bounded";
import TableWrapper from "@/components/ui/Table";
import Container from "@/components/wrappers/Container";
import EmptyState from "@/components/ui/EmptyState";
import { Inbox } from "lucide-react";
import { format } from "date-fns";
import Heading from "@/components/ui/Heading";

const UserOrders = () => {
	const { user } = useAppContext();
	const { user_metadata: userMetaData } = user?.data?.user || "";
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!user?.data.user && !userMetaData) {
			redirect("/");
		} else {
			GET__orders(null, user.data.user.id).then(({ orders, error }) => {
				if (error) {
					setError(error);
				} else {
					setOrders(orders);
				}
			});
		}
	}, [user, userMetaData]);

	if (error) return <div>Error: {error.message}</div>;

	const columns = [
		{ header: "Part Name", accessor: "part_name" },
		{ header: "Vehicle Make", accessor: "vehicle_make" },
		{ header: "Variant", accessor: "variant" },
		{ header: "Model", accessor: "model" },
		{ header: "Status", accessor: "status" },
		{
			header: "Created At",
			accessor: "created_at",
			render: (value) => format(new Date(value), "do MMMM, yyyy h:mm a"),
		},
	];

	if (!orders || orders.length === 0) {
		return (
			<div className='p-4'>
				<EmptyState
					title='No Orders Found'
					description='There are no orders to display at the moment.'
					icon={<Inbox size={40} />}
				/>
			</div>
		);
	}

	return (
		<Bounded className='b__size-md b__size-fit-to-screen'>
			<Container>
				<Heading className='u__h3'>Orders</Heading>
				<div className='mx-auto text-center'>
					<div className='overflow-x-auto'>
						<div className='min-w-max'>
							<TableWrapper caption='Orders' columns={columns} data={orders} />
						</div>
					</div>
				</div>
			</Container>
		</Bounded>
	);
};

export default UserOrders;
