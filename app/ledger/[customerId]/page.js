"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import LedgerPDF from "@/components/ui/LedgerPDF";
import { GET__customers } from "@/services/queries-csr";
import { LEDGER__services } from "@/services/queries-csr";

const LedgerPage = () => {
	const router = useRouter();
	const params = useParams();
	const [customer, setCustomer] = useState(null);
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const customerId = params?.customerId;
				if (!customerId) throw new Error("Invalid customer ID");
				// Get customer
				const { data: customerData, error: customerError } =
					await GET__customers.getCustomerById(customerId);
				if (customerError || !customerData)
					throw new Error(customerError || "Customer not found");
				// Get ledger-specific data
				const [
					{ payments, error: paymentsError },
					{ orders, error: ordersError },
				] = await Promise.all([
					LEDGER__services.getPaymentsByCustomer(customerId),
					LEDGER__services.getOrdersByCustomer(customerId),
				]);
				if (paymentsError) throw new Error(paymentsError);
				if (ordersError) throw new Error(ordersError);
				// Merge transactions
				const merged = [
					...(orders || []).map((o) => ({
						...o,
						type: "order",
						date: o.order_date,
						amount: o.total_bill,
					})),
					...(payments || []).map((p) => ({
						...p,
						type: "payment",
						date: p.payment_date,
					})),
				].sort((a, b) => new Date(b.date) - new Date(a.date));
				setCustomer(customerData);
				setTransactions(merged);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [params?.customerId]);

	if (loading) {
		return <div className='p-4 text-center'>Loading ledger...</div>;
	}
	if (error) {
		return (
			<div className='p-4 text-red-500'>
				Error loading ledger: {error}
				<button
					onClick={() => router.push("/dashboard")}
					className='ml-4 px-4 py-2 bg-gray-200 rounded'
				>
					Back to Dashboard
				</button>
			</div>
		);
	}
	if (!customer || transactions.length === 0) {
		return (
			<div className='p-4 text-center'>
				No ledger data available for this customer
				<button
					onClick={() => router.push("/dashboard")}
					className='ml-4 px-4 py-2 bg-gray-200 rounded'
				>
					Back to Dashboard
				</button>
			</div>
		);
	}

	return (
		<div className='p-4'>
			<div className='flex gap-4'>
				<PDFDownloadLink
					document={
						<LedgerPDF customer={customer} transactions={transactions} />
					}
					fileName={`${customer.business_name}_ledger.pdf`}
					className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
				>
					{({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
				</PDFDownloadLink>

				<button
					onClick={() => window.print()}
					className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
				>
					Print Ledger
				</button>
			</div>
			<PDFViewer width='100%' height='1000px' className='border rounded-lg'>
				<LedgerPDF customer={customer} transactions={transactions} />
			</PDFViewer>
		</div>
	);
};

export default LedgerPage;
