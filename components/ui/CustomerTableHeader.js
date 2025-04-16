import React from "react";
import Button from "./Button";
import { formatCurrency } from "../../lib/helpers";
import { Badge } from "@/components/ui/shadcn/badge";

const CustomerTableHeader = (props) => {
	const { customer } = props;
	return (
		<div>
			<div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm'>
				<div className='space-y-1'>
					<p className='font-medium'>Contact Information</p>
					<p>{customer.contact_name}</p>
					<p>{customer.email}</p>
					<p>{customer.business_contact}</p>
				</div>
				<div className='space-y-1'>
					<p className='font-medium'>Address</p>
					<p>{customer.address}</p>
					<p>
						{customer.city}, {customer.country}
					</p>
				</div>
				<div className='text-right space-y-1 flex justify-end items-start'>
					<Button
						className='!bg-transparent underline !text-green-600 !text-sm !px-4 cursor-pointer'
						onClick={(e) => {
							e.stopPropagation();
							window.open(`/ledger/${customer.id}`, "_blank");
						}}
						title={"Show Ledger"}
						actionable={true}
					/>
					<div>
						{!!customer.previous_balance && (
							<>
								<p className='text-xs text-gray-500'>Previous Balance</p>
								<p className='font-medium text-green-600'>
									{formatCurrency(customer.previous_balance)}
								</p>
							</>
						)}
						<p className='text-xs text-gray-500'>Total Balance</p>
						<p className='font-medium text-green-600'>
							{formatCurrency(
								(customer?.customer_balance || 0) +
									(customer?.customer_labour_balance || 0) +
									customer.previous_balance
							)}
						</p>

						<div className='mt-1'>
							{customer?.customer_balance + customer?.previous_balance + customer?.customer_labour_balance > 0 ? (
								<Badge className='bg-red-200 text-red-800 text-xs'>
									Pending
								</Badge>
							) : (
								<Badge className='bg-green-200 text-green-800 text-xs'>
									Completed
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerTableHeader;
