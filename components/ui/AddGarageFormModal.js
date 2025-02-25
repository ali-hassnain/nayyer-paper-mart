import React from "react";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import Form from "@/components/ui/Form";
import { useState } from "react";
import { SCHEMA__AddGarageForm } from "@/lib/schema";
import { POST__addGarage } from "../../services/actions";

const AddGarageFormModal = (props) => {
	const { isModalOpen, setIsModalOpen } = props;
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
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

	const onSubmit = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);
		const payload = {
			name: formData?.garageName,
			area: formData?.mapPinLocation?.area,
			contact_name: formData?.contactPersonName,
			contact_phone: formData?.contactPersonNumber,
			location_url: formData?.mapPinLocation?.pinLocation,
			location_long: formData?.mapPinLocation?.longitude,
			location_lat: formData?.mapPinLocation?.latitude,
		};
		try {
			const { error } = await POST__addGarage(payload);
			if (error) {
				throw new Error(`Error: ${error.message}`);
			}
			setPayloadPosting(false);
			setFormMessage({
				type: `success`,
				message: `Garage added successfully updated.`,
			});
			setTimeout(() => {
				setIsModalOpen(false);
			}, 1000);
		} catch (error) {
			console.log(error);
			setPayloadPosting(false);
			setFormMessage({
				type: `error`,
				message: error.message,
			});
		}
	};

	return (
		<Modal
			title='Add Garage'
			content={
				<div className={"overflow-y-scroll h-[60vh]"}>
					<Form
						isValid={isValid}
						formFields={SCHEMA__AddGarageForm}
						register={register}
						errors={errors}
						control={control}
						buttonTitle={`Save`}
						onSubmit={handleSubmit(onSubmit)}
						payloadPosting={payloadPosting}
						formMessage={formMessage}
						buttonClass={"w-full mt-2"}
					/>
				</div>
			}
			isOpen={isModalOpen}
			showActionButtons={false}
			onClose={() => {
				setIsModalOpen(false);
				setFormMessage(null);
				reset();
			}}
		/>
	);
};

export default AddGarageFormModal;
