import React, { useState } from "react";
import ItemCard from "@/components/ui/ItemCard";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import { SCHEMA__RejectReasonForm } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { salesStatus } from "@/lib/constants";
import ConfirmableToggleSwitch from "@/components/ui/ConfirmableToggleSwitch";
import { purchaserStatus } from "@/lib/constants";
import { PATCH__updateOrder } from "@/services/actions";
import { toast } from "sonner";
import useSignedUrls from "@/lib/hooks/useSignedUrl";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import ImageGallery from "@/components/ui/PinesImageGallery";

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
	const [quoteImagesModalOpen, setQuoteImagesModalOpen] = useState(false);
	const { quotation, status, setActiveTab } = props;
	const { signedUrls: quotationImageSrc, loading: quotationImageLoading } =
		useSignedUrls(quotation?.parts_images || []);
	const quotationTime = format(
		new Date(quotation.created_at),
		"do MMM, yyyy h:mma"
	).toLowerCase();
	const router = useRouter();
	const { signedUrls: quoteImages, loading: quoteImagesLoading } =
		useSignedUrls(quotation?.quote_images);

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
			setTimeout(() => {
				router.push("/");
			}, 1000);
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
				status: purchaserStatus.APPROVED,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: quotation.id,
				updatePayload: payload,
			});
			setIsConfirmationModalOpen(false);
			toast.success("The purchaser is notified to deliver the product");
			setTimeout(() => {
				setIsConfirmationModalOpen(false);
			}, 1000);
			setActiveTab(1);
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
				title={"Accept Quotation confirmation"}
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
			<Modal
				title={"Quote part images"}
				content={
					quoteImagesLoading ? (
						<Spinner />
					) : (
						<div>
							<ImageGallery images={quoteImages} loading={quoteImagesLoading} />
						</div>
					)
				}
				isOpen={quoteImagesModalOpen}
				onClose={() => setQuoteImagesModalOpen(false)}
				showActionButtons={false}
			/>
			<ItemCard
				footerClassName={"justify-end"}
				key={quotation.id}
				post={quotation}
				imageSrc={quotationImageSrc[0]}
				imageLoader={quotationImageLoading}
				headerContent={
					<div
						className={"cursor-pointer"}
						onClick={() => setQuoteImagesModalOpen(true)}
					>
						<h3 className='text-lg font-semibold hover:underline md:text-xl'>
							<a href={quotation.url} target='_blank' rel='noopener noreferrer'>
								{quotation.part_name}
							</a>
							<p className={"text-lg font-semibold md:text-xl"}>
								{quotation.quote_price} AED
							</p>
						</h3>
					</div>
				}
				content={
					<>
						<p className='text-muted-foreground'>
							{quotation.vehicle_make} {quotation.variant}
						</p>
						<p>{quotationTime}</p>
					</>
				}
				footerContent={
					<>
						{status === salesStatus.QUOTATION && (
							<div className={"gap-2 flex "}>
								<Button
									title={"Reject"}
									actionable={true}
									onClick={() => setIsRejectionModalOpen(true)}
									theme={"ghost-secondary"}
									className={"!py-2 !px-4"}
								/>
								<Button
									actionable={true}
									title={`Accept`}
									onClick={() => setIsConfirmationModalOpen(true)}
									theme={"ghost-primary"}
									className={"!py-2 !px-4"}
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
