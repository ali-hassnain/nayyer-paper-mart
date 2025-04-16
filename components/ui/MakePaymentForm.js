import Form from "@/components/ui/Form";
import { POST__createPayment } from "@/services/actions";
import React from "react";
import { SCHEMA__PaymentFormSchema } from "@/lib/schema";

const MakePaymentForm = (props) => {
	const {
		selectedCustomer,
		rhfHandleSubmit,
		setPayloadPosting,
		setFormMessage,
		userId,
		supabase,
		setLocalCustomers,
		setShowPaymentModal,
		setSelectedCustomer,
		reset,
		fetchOrdersForCustomer,
		control,
		errors,
		formMessage,
		payloadPosting,
		register,
		handleUploadImages,
	} = props;
	return (
		<div className='p-4 h-full overflow-y-scroll'>
			<Form
				formFields={SCHEMA__PaymentFormSchema(
					selectedCustomer?.customer_balance
				)}
				buttonTitle='Add Payment'
				onSubmit={rhfHandleSubmit(async (formData) => {
					setPayloadPosting(true);
					setFormMessage(null);
					try {
						if (!selectedCustomer?.id) {
							throw new Error("No customer selected");
						}
						// 1. Get fresh order data from server
						const paymentAmount = Number(formData.payment_amount);
						if (isNaN(paymentAmount) || paymentAmount <= 0) {
							throw new Error("Invalid payment amount");
						}
						let proofUrl = null;
						if (formData.payment_proof?.[0]) {
							proofUrl = await handleUploadImages(formData.payment_proof[0]);
						}
						const paymentPayload = {
							customer: selectedCustomer.id,
							amount: paymentAmount,
							payment_mode: formData.payment_mode,
							payment_date: new Date(formData.payment_date).toISOString(),
							proof: proofUrl,
							user_id: userId,
						};
						const { payment, error: paymentError } = await POST__createPayment(
							paymentPayload
						);
						if (paymentError) throw paymentError;
						const { data: customerData, error: customerError } = await supabase
							.from("customers")
							.select("customer_balance")
							.eq("id", selectedCustomer.id)
							.single();
						if (customerError) throw customerError;
						const newBalance =
							(customerData.customer_balance || 0) - paymentAmount;
						const { data: updateData, error: updateError } = await supabase
							.from("customers")
							.update({ customer_balance: newBalance })
							.eq("id", selectedCustomer.id)
							.select();
						if (updateError) throw updateError;
						setLocalCustomers((prev) => ({
							...prev,
							[selectedCustomer.id]: {
								...prev[selectedCustomer.id],
								customer_balance: newBalance,
							},
						}));
						// 10. Close modal and reset
						setFormMessage({
							type: "success",
							message: "Payment added successfully!",
						});
						setTimeout(() => {
							setShowPaymentModal(false);
							setSelectedCustomer(null);
							reset();
						}, 1500);
						fetchOrdersForCustomer(selectedCustomer.id);
					} catch (error) {
						setFormMessage({
							type: "error",
							message: error.message || "Payment processing failed",
						});
					} finally {
						setPayloadPosting(false);
						setFormMessage(null);
					}
				})}
				register={register}
				control={control}
				errors={errors}
				sectionClassName='grid gap-4 py-4'
				sectionTitleClassName='text-sm font-medium border-b pb-2 mb-2'
				fieldWrapperClassName='grid grid-cols-4 items-center gap-4'
				labelClassName='text-sm font-medium'
				inputClassName='col-span-3'
				payloadPosting={payloadPosting}
				formMessage={formMessage}
				defaultValues={{
					customer_id: selectedCustomer?.id || "",
				}}
			/>
		</div>
	);
};

export default MakePaymentForm;
