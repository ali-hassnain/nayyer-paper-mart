import { format } from "date-fns";
import Image from "next/image";
import { formatCurrency, removeUnderscores } from "@/lib/helpers";

const PaymentDetails = ({ payment }) => {
	if (!payment) return null;

	return (
		<div className='payment-details-container p-6 max-w-2xl mx-auto'>
			{/* Proof Image Section */}
			{payment.proof && (
				<div className='mb-6'>
					<a
						href={payment.proof}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-block hover:opacity-75 transition-opacity'
					>
						<Image
							src={payment.proof}
							alt='Payment proof'
							className='max-w-full h-48 object-contain border rounded-lg'
							onError={(e) => {
								e.target.style.display = "none";
							}}
							width={30000}
							height={30000}
						/>
					</a>
					<p className='mt-2 text-sm text-gray-500'>
						Click image to view in full size
					</p>
				</div>
			)}
			{/* Payment Details Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
				<DetailItem label='Payment ID' value={payment.id} />
				<DetailItem
					label='Amount'
					value={`${formatCurrency(payment.amount)}`}
				/>
				<DetailItem
					label='Payment Mode'
					value={removeUnderscores(payment.payment_mode)}
				/>
				<DetailItem
					label='Payment Date'
					value={format(new Date(payment.payment_date), "PPpp")}
				/>
				<DetailItem
					label='Customer Type'
					value={payment.customer?.customer_type}
				/>
			</div>
		</div>
	);
};

// Helper component for individual detail rows
const DetailItem = ({ label, value }) => (
	<div className='border-b pb-2'>
		<dt className='font-medium text-gray-500'>{label}</dt>
		<dd className='mt-1 text-gray-900'>
			{value || <span className='text-gray-400'>N/A</span>}
		</dd>
	</div>
);

export default PaymentDetails;
