import React from "react";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import Form from "@/components/ui/Form";
import { useState } from "react";
import { SCHEMA__AddCustomerForm } from "@/lib/schema";
import { POST__addCustomer } from "@/services/actions";
import { useAppContext } from "@/context/AppWrapper";

const AddCustomerFormModal = (props) => {
	const { isModalOpen, setIsModalOpen } = props;
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const { user } = useAppContext();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm({
		mode: "all",
		defaultValues: {
			city: "Lahore",
			country: "Pakistan",
		},
	});

	const onSubmit = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);
		const payload = {
			business_name: formData?.business_name,
			business_contact: formData?.business_contact,
			contact_name: formData?.contact_name,
			city: formData?.city,
			country: formData?.country,
			email: formData?.email || null,
			address: formData?.address || null,
			created_by: user?.data?.user?.id,
			customer_type: formData?.customer_type,
		};
		try {
			const { error } = await POST__addCustomer(payload);
			if (error) throw new Error(`Error: ${error.message}`);
			setFormMessage({
				type: "success",
				message: "Customer added successfully",
			});
			setTimeout(() => setIsModalOpen(false), 1000);
			reset();
		} catch (error) {
			setFormMessage({ type: "error", message: error.message });
		} finally {
			setPayloadPosting(false);
		}
	};

	return (
		<Modal
			title='Add New Customer'
			content={
				<div className='overflow-y-scroll h-[60vh]'>
					<Form
						formId='customer-form'
						register={register}
						errors={errors}
						control={control}
						formFields={SCHEMA__AddCustomerForm}
						buttonTitle={`Add New Customer`}
						onSubmit={handleSubmit(onSubmit)}
						payloadPosting={payloadPosting}
						formMessage={formMessage}
						buttonClass={"w-full mt-2 sticky bottom-0 z-10 bg-white pt-4"}
					/>
					{formMessage && (
						<div
							className={`text-center mt-4 text-${
								formMessage.type === "success" ? "green" : "red"
							}-500`}
						>
							{formMessage.message}
						</div>
					)}
				</div>
			}
			isOpen={isModalOpen}
			showActionButtons={false}
			onClose={() => {
				setIsModalOpen(false);
				setFormMessage(null);
				reset({
					city: "Lahore",
					country: "Pakistan",
				});
			}}
		/>
	);
};

export default AddCustomerFormModal;
