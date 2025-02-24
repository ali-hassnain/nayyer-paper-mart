import React, { useState } from "react";
import Image from "next/image";
import ItemCard from "@/components/ui/ItemCard";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import { SCHEMA__RejectReasonForm } from "../../lib/schema";
import { useForm } from "react-hook-form";
import { salesStatus } from "@/lib/constants";
import ConfirmableToggleSwitch from "@/components/ui/ConfirmableToggleSwitch";
import { purchaserStatus } from "@/lib/constants";
import { PATCH__updateOrder } from "@/services/actions";
import { toast } from "sonner";

const QuotationCard = (props) => {
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
		formState: { isValid },
	} = useForm({
		mode: "all",
	});
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);

	const { quotation, status } = props;
	console.log("-> quotation", quotation);

	const updateToggleStatuses = async (key) =>
		await PATCH__updateOrder({
			orderId: quotation.id,
			updatePayload: { [key]: true },
		});

	const onSubmitRejectionReason = async (formData) => {
		setPayloadPosting(true);
		console.log(formData);
		try {
			const payload = {
				status: purchaserStatus.REJECTED,
				reject_reason: `${formData.reason} - ${formData.comment}`,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: quotation.id,
				updatePayload: payload,
			});
			setIsConfirmationModalOpen(false);
			setFormMessage({
				type: `success`,
				message: `Purchaser is notified of rejected quote.`,
			});
		} catch (error) {
			console.log("-> error", error);
			setFormMessage({
				type: `error`,
				message: error.message,
			});
		} finally {
			setPayloadPosting(false);
			reset();
		}
	};

	const onAcceptingQuotation = async () => {
		try {
			const payload = {
				status: purchaserStatus.PENDING,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: quotation.id,
				updatePayload: payload,
			});
			setIsConfirmationModalOpen(false);
			toast.success("The purchaser is notified to deliver the product");
		} catch (error) {
			console.log(error);
			setPayloadPosting(false);
			toast.error(error);
		} finally {
			setFormMessage(null);
		}
	};
	return (
		<div>
			<ConfirmationModal
				message={"Are you sure you want to approve this quotation?"}
				isOpen={isConfirmationModalOpen}
				onConfirm={onAcceptingQuotation}
				onCancel={() => setIsConfirmationModalOpen(false)}
				onClose={() => setIsConfirmationModalOpen(false)}
			/>
			<Modal
				title='Reason For Rejection'
				content={
					<Form
						isValid={isValid}
						formFields={SCHEMA__RejectReasonForm}
						register={register}
						errors={errors}
						control={control}
						buttonTitle={`Save`}
						onSubmit={handleSubmit(onSubmitRejectionReason)}
						payloadPosting={payloadPosting}
						formMessage={formMessage}
						buttonClass={"w-full mt-2"}
					/>
				}
				showActionButtons={false}
				isOpen={isRejectionModalOpen}
				onClose={() => {
					setIsRejectionModalOpen(false);
					setPayloadPosting(false);
					setFormMessage(null);
					reset();
				}}
			/>
			{console.log("quotation", quotation)}
			<ItemCard
				key={quotation.id}
				post={quotation}
				image={
					<a
						href={quotation.url}
						target='_blank'
						rel='noopener noreferrer'
						className='block transition-opacity duration-200 fade-in hover:opacity-70'
					>
						<Image
							src={quotation.parts_images[0]}
							alt={`${quotation.vehicle_make} - ${quotation.variant}`}
							fill
							className='object-cover object-center'
						/>
					</a>
				}
				headerContent={
					<h3 className='text-lg font-semibold hover:underline md:text-xl'>
						<a href={quotation.url} target='_blank' rel='noopener noreferrer'>
							{quotation.part_name}
						</a>
					</h3>
				}
				content={
					<>
						<p className='text-muted-foreground'>
							{quotation.vehicle_make} {quotation.variant}
						</p>
					</>
				}
				footerContent={
					<>
						{status === salesStatus.QUOTATION && (
							<div className={"gap-2 flex"}>
								<Button
									actionable={true}
									title={`Accept`}
									onClick={() => setIsConfirmationModalOpen(true)}
								/>
								<Button
									title={"Reject"}
									actionable={true}
									onClick={() => setIsRejectionModalOpen(true)}
								/>
								<Button />
							</div>
						)}
						{status === salesStatus.DELIVERY && (
							<div className='grid grid-cols-1 gap-1'>
								<ConfirmableToggleSwitch
									id='return'
									label='Return this product'
									apiCall={() => updateToggleStatuses("is_returned")}
									size='large'
									confirmationMessage={
										"Are you sure you want to return this part?"
									}
									defaultChecked={!!quotation.is_returned}
								/>
								<ConfirmableToggleSwitch
									id='test'
									label='Successfully Tested'
									apiCall={() => updateToggleStatuses("is_tested")}
									size='large'
									confirmationMessage={
										"Are you sure this part is tested successfully?"
									}
									defaultChecked={!!quotation.is_tested}
								/>
								<ConfirmableToggleSwitch
									id='payment'
									label='Payment Received'
									apiCall={() => updateToggleStatuses("is_paid")}
									size='large'
									confirmationMessage={
										"Are you sure you have received the payment for this part?"
									}
									defaultChecked={!!quotation.is_paid}
								/>
							</div>
						)}
					</>
				}
			/>
		</div>
	);
};

export default QuotationCard;
