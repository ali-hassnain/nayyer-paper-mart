import React, { useState } from "react";
import TableWrapper from "@/components/ui/Table";
import AccordionWrapper from "@/components/ui/Accordian";
import { purchaserStatus } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form from "@/components/ui/Form";
import { useForm } from "react-hook-form";
import { SCHEMA__SendQuotationForm } from "@/lib/schema";
import { imageUploadProcess } from "@/lib/helpers";
import { supabaseStorageBucketURL } from "@/lib/constants";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppWrapper";
import { PATCH__updateOrder } from "@/services/actions";
import { salesStatus } from "@/lib/constants";

const InquiryTable = ({
	inquiries = [],
	tableColumns,
	status,
	fetchOrders = () => {},
}) => {
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const { user } = useAppContext();
	const userId = user?.data?.user?.id;
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
	// State to manage modal visibility, selected row and modal type.
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedRow, setSelectedRow] = useState(null);
	const [modalType, setModalType] = useState("");

	// Updated modal functions using state.
	const openQuoteModal = (row) => {
		setSelectedRow(row);
		setModalType("quote");
		setModalOpen(true);
	};

	const openShippedModal = (row) => {
		setSelectedRow(row);
		setModalType("approved");
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setSelectedRow(null);
		setModalType("");
	};

	const handleConfirm = async () => {
		try {
			const payload = {
				status: purchaserStatus.PENDING,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: selectedRow.id,
				updatePayload: payload,
			});
			closeModal();
			toast.success("The salesperson is notified about delivery confirmation");
		} catch (error) {
			console.log(error);
			setPayloadPosting(false);
			toast.error(error);
		} finally {
			setFormMessage(null);
			closeModal();
			reset();
		}
	};

	const handleCancel = () => {
		closeModal();
		reset();
	};
	const onSubmitQuotation = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);
		try {
			const uploadedQuoteImages = handleUploadQuoteImages(formData);
			console.log("-> uploadedQuoteImages", uploadedQuoteImages);
			if (uploadedQuoteImages.quote_pictures?.length === 0) return;
			const payload = {
				status: salesStatus.QUOTATION,
				quote_price: formData.quote_price,
				quote_images: uploadedQuoteImages.quote_pictures,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: selectedRow.id,
				updatePayload: payload,
			});
			setPayloadPosting(false);
			setFormMessage({
				type: `success`,
				message: `Quote sent successfully to the salesperson.`,
			});
			fetchOrders(purchaserStatus.OPEN);
		} catch (error) {
			console.log("-> error", error);
			setPayloadPosting(false);
			setFormMessage({
				type: `error`,
				message: error.message,
			});
		}
	};

	const handleUploadQuoteImages = (formData) => {
		const results = {};
		if (formData.quote_pictures?.[0]) {
			imageUploadProcess({
				files: formData.quote_pictures,
				userId,
				bucketName: "quote-images",
				storageBucketURL: supabaseStorageBucketURL("quote-images"),
				onProgressUpdate: (file, progress) =>
					console.log(`${file.name}: ${progress}%`),
				onFileUploaded: (fileData) => {
					results.quote_pictures = fileData.src;
				},
				onCompletion: () => console.log("Quote pictures upload complete"),
				onError: (file, message) => toast.error(`${file.name}: ${message}`),
			})();
		}
		return results;
	};

	// Define default columns (excluding the Actions column initially)
	const defaultColumns = [
		{
			header: "Part Name",
			accessor: "part_name",
		},
		{
			header: "Make",
			accessor: "vehicle_make",
		},
		{
			header: "Variant",
			accessor: "variant",
		},
		{
			header: "Model",
			accessor: "model",
		},
	];

	// Add the Actions column if a valid status is provided
	if (status === purchaserStatus.OPEN || status === purchaserStatus.APPROVED) {
		defaultColumns.push({
			header: "Actions",
			accessor: "actions",
			render: (value, row) => {
				if (status === purchaserStatus.OPEN) {
					return (
						<Button
							className='btn btn-primary'
							onClick={() => openQuoteModal(row)}
							actionable={true}
							title={"Quote"}
						/>
					);
				} else if (status === purchaserStatus.APPROVED) {
					return (
						<Button
							className='btn btn-primary'
							onClick={() => openShippedModal(row)}
							actionable={true}
							title={"ship"}
						/>
					);
				}
			},
		});
	} else {
		// If no status is provided, just add a blank Actions column
		defaultColumns.push({
			header: "Actions",
			accessor: "actions",
		});
	}

	const columns = tableColumns || defaultColumns;

	// Map each inquiry into an accordion item with a table showing parts details.
	// Enhance each part row with inquiry.makeAndModel so that we can use it in the modal.
	const accordionItems = inquiries.map((inquiry, index) => ({
		value: inquiry.id || `inquiry-${index}`,
		trigger: `${inquiry.vehicle_make} ${inquiry.variant}`,
		content: (
			<div className='overflow-x-auto'>
				<div className='min-w-max '>
					<TableWrapper
						caption={`Parts for ${inquiry.vehicle_make} ${inquiry.variant}`}
						columns={columns}
						data={[inquiry]}
					/>
				</div>
			</div>
		),
	}));

	// Determine modal title and content based on modalType and selectedRow.
	let modalTitle = "";
	let modalContent = null;
	if (modalType === "quote" && selectedRow) {
		modalTitle = `Quote for ${selectedRow.part_name} - ${selectedRow.vehicle_make} ${selectedRow.variant}`;
		modalContent = (
			<Form
				isValid={isValid}
				formFields={SCHEMA__SendQuotationForm}
				register={register}
				errors={errors}
				control={control}
				buttonTitle={`Save`}
				onSubmit={handleSubmit(onSubmitQuotation)}
				buttonClass={"w-full mt-2"}
				payloadPosting={payloadPosting}
				formMessage={formMessage}
			/>
		);
	} else if (modalType === "approved" && selectedRow) {
		modalTitle = `Shipping Confirmation`;
		modalContent = (
			<div>
				<p>
					Inquiry: <strong>{selectedRow.part_name}</strong>
				</p>
				<p>
					Are you sure you want to confirm shipping for the part:{" "}
					<strong>{selectedRow.part_name}</strong>?
				</p>
				<div>{""}</div>
				<p>
					Vehicle Details:{" "}
					<strong>
						{" "}
						{selectedRow.vehicle_make} {selectedRow.variant}{" "}
					</strong>
				</p>
				<p>
					Model Year: <strong> {selectedRow.model} </strong>
				</p>
			</div>
		);
	}

	return (
		<>
			<AccordionWrapper items={accordionItems} className='w-full' />
			<div className={"overflow-y-scroll h-[60vh]"}>
				<Modal
					title={modalTitle}
					content={modalContent}
					isOpen={modalOpen}
					onClose={closeModal}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					showActionButtons={modalType === "approved" ? true : false}
				/>
			</div>
		</>
	);
};

export default InquiryTable;
