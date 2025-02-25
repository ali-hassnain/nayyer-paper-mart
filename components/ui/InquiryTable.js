import React, { useState, useEffect } from "react";
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
import ImageGallery from "@/components/ui/PinesImageGallery";
import Spinner from "@/components/ui/Spinner";
import useSignedUrls from "@/lib/hooks/useSignedUrl";
import Heading from "@/components/ui/Heading";
import HoverCard from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/shadcn/Badge";

const InquiryTable = ({
	inquiries = [],
	tableColumns,
	status,
	fetchOrders = () => {},
	setActiveTab = () => {},
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
	const [chassisPics, setChassisPics] = useState([]);
	const [partsPics, setPartsPics] = useState([]);

	useEffect(() => {
		if (selectedRow) {
			const chassis =
				typeof selectedRow.chassis_pic === "string"
					? JSON.parse(selectedRow.chassis_pic)
					: selectedRow.chassis_pic || [];

			const parts =
				typeof selectedRow.parts_images === "string"
					? JSON.parse(selectedRow.parts_images)
					: selectedRow.parts_images || [];

			setChassisPics(chassis);
			setPartsPics(parts);
		} else {
			setChassisPics([]);
			setPartsPics([]);
		}
	}, [selectedRow]);

	const { signedUrls: chassisImageSrc, loading: chassisLoading } =
		useSignedUrls(chassisPics);
	const { signedUrls: partsImageSrc, loading: partsLoading } =
		useSignedUrls(partsPics);

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

	// for approved actions
	const handleConfirm = async () => {
		try {
			const payload = {
				status: salesStatus.DELIVERY,
			};
			const { data, error } = await PATCH__updateOrder({
				orderId: selectedRow.id,
				updatePayload: payload,
			});
			closeModal();
			toast.success("The salesperson is notified about delivery confirmation");
			fetchOrders(purchaserStatus.APPROVED);
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

	const handleUploadQuoteImages = async (formData) => {
		const results = {};
		if (formData.quote_pictures?.[0]) {
			await new Promise((resolve) => {
				imageUploadProcess({
					files: formData.quote_pictures,
					userId,
					bucketName: "quote-images",
					storageBucketURL: supabaseStorageBucketURL,
					onProgressUpdate: (file, progress) =>
						console.log(`${file.name}: ${progress}%`),
					onFileUploaded: (fileData) => {
						results.quote_pictures = results.quote_pictures || [];
						results.quote_pictures.push(fileData.src);
					},
					onCompletion: resolve,
					onError: (file, message) => toast.error(`${file.name}: ${message}`),
				})();
			});
		}
		return results;
	};

	const onSubmitQuotation = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);

		try {
			const uploadedQuoteImages = await handleUploadQuoteImages(formData);
			if (
				!uploadedQuoteImages.quote_pictures ||
				uploadedQuoteImages.quote_pictures.length === 0
			) {
				throw new Error(
					"No images uploaded. Please upload at least one image."
				);
			}
			const payload = {
				status: salesStatus.QUOTATION,
				quote_price: formData.quote_price,
				quote_images: uploadedQuoteImages.quote_pictures,
			};
			if (!payload.quote_images?.length) {
				throw new Error("Image upload failed. Please try again.");
			}
			const { data, error } = await PATCH__updateOrder({
				orderId: selectedRow.id,
				updatePayload: payload,
			});
			setPayloadPosting(false);
			setFormMessage({
				type: "success",
				message: "Quote sent successfully to the salesperson.",
			});
			setActiveTab(1);
			// fetchOrders(purchaserStatus.QUOTATION);
		} catch (error) {
			console.error("❌ Submission Error:", error);
			setPayloadPosting(false);
			setFormMessage({
				type: "error",
				message: error.message,
			});
		}
	};

	const defaultColumns = [
		{
			header: "Part Name",
			accessor: "part_name",
			render: (value, row) => (
				<button
					className='text-blue-500 underline hover:text-blue-700'
					onClick={(e) => {
						e.stopPropagation();
						setSelectedRow(row);
						setModalType("details");
						setModalOpen(true);
					}}
				>
					{value}
				</button>
			),
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
							onClick={() => openQuoteModal(row)}
							actionable={true}
							title={"Quote"}
							theme={"ghost-primary"}
							className={"!py-2 !px-4"}
						/>
					);
				} else if (status === purchaserStatus.APPROVED) {
					return (
						<Button
							theme={"ghost-primary"}
							onClick={() => openShippedModal(row)}
							actionable={true}
							title={"Ship"}
							className={"!py-2 !px-4"}
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
		trigger: (
			<div className='flex items-center gap-2'>
				<span>{`${inquiry.vehicle_make} ${inquiry.variant}`}</span>
				{inquiry.status === purchaserStatus.REJECTED && (
					<HoverCard content={inquiry.reject_reason}>
						<Badge
							className={`inline-block bg-red-900 text-white text-xs font-semibold px-2 py-1 rounded`}
						>
							{inquiry.status}
						</Badge>
					</HoverCard>
				)}
			</div>
		),
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
	if (modalType === "details" && selectedRow) {
		modalContent = chassisLoading ? (
			<Spinner />
		) : (
			<div>
				<Heading className='u__h5 my-2'>Mulkiya/Chassis Image</Heading>
				<ImageGallery images={chassisImageSrc} loading={chassisLoading} />
				<Heading className='u__h5 my-2'>Parts Images</Heading>
				<ImageGallery images={partsImageSrc} loading={partsLoading} />
			</div>
		);
	} else if (modalType === "quote" && selectedRow) {
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
					<strong>{selectedRow.part_name}</strong> at the price of{" "}
					<strong>{selectedRow.quote_price} AED</strong>?
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
