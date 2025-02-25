"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import AuthCard from "@/components/ui/AuthCard";
import Form from "@/components/ui/Form";
import Bounded from "@/components/wrappers/Bounded";
import Container from "@/components/wrappers/Container";
import { SCHEMA__PartOrderForm } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { createClient } from "@/supabase/client";
import { useAppContext } from "@/context/AppWrapper";
import Button from "@/components/ui/Button";
import AddGarageFormModal from "@/components/ui/AddGarageFormModal";
import { usePaginatedOptions } from "@/lib/hooks/usePaginatedOptions";
import { toast } from "sonner";
import { imageUploadProcess } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { purchaserStatus, supabaseStorageBucketURL } from "@/lib/constants";

const CreateOrderForm = () => {
	const { user } = useAppContext();
	const userId = user?.data?.user?.id;
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
		formState: { isValid },
		setValue,
	} = useForm({
		mode: "all",
	});
	const [formMessage, setFormMessage] = useState(null);
	const [payloadPosting, setPayloadPosting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [dependencies, setDependencies] = useState({
		makeId: null,
		variantId: null,
	});
	const { loadOptions, updatePage } = usePaginatedOptions();
	const router = useRouter();

	const makeLoader = useCallback(
		(search, loadedOptions, { page }) => loadOptions("makes", search),
		[loadOptions]
	);

	const variantLoader = useCallback(
		(search, loadedOptions, { page }) =>
			loadOptions("variants", search, dependencies.makeId),
		[loadOptions, dependencies.makeId]
	);

	const yearLoader = useCallback(
		(search, loadedOptions, { page }) =>
			loadOptions("model_years", search, dependencies.variantId),
		[loadOptions, dependencies.variantId]
	);

	const garageLoader = useCallback(
		(search, prevOptions, additional) =>
			loadOptions("garages", search, null, additional),
		[loadOptions]
	);

	const handleMakeChange = (selectedOption) => {
		const newMakeId = selectedOption?.value || null;
		setDependencies({
			makeId: newMakeId,
			variantId: null,
		});
		setValue("variant", null);
		setValue("model_year", null);
	};

	const handleVariantChange = (selectedOption) => {
		const newVariantId = selectedOption?.value || null;
		setDependencies((prev) => ({
			...prev,
			variantId: newVariantId,
		}));
		setValue("model_year", null);
	};

	const handleFileUploads = async (formData) => {
		const uploadPromises = [];
		const results = {};
		if (formData.mulkiya_chassis?.[0]) {
			uploadPromises.push(
				new Promise(async (resolve) => {
					const signedURL = await imageUploadProcess({
						files: formData.mulkiya_chassis,
						userId,
						bucketName: "mulkiya",
						storageBucketURL: supabaseStorageBucketURL,
						onProgressUpdate: (file, progress) =>
							console.log(`${file.name}: ${progress}%`),
						onFileUploaded: (fileData) => {
							results.mulkiya_chassis = fileData.src;
						},
						onCompletion: () => {},
						onError: (file, message) => toast.error(`${file.name}: ${message}`),
					})();
					resolve(signedURL);
				})
			);
		}
		if (formData.part_pictures?.length) {
			uploadPromises.push(
				new Promise(async (resolve) => {
					const signedURLs = await imageUploadProcess({
						files: formData.part_pictures,
						userId,
						bucketName: "request-images",
						storageBucketURL: supabaseStorageBucketURL,
						onProgressUpdate: (file, progress) =>
							console.log(`${file.name}: ${progress}%`),
						onFileUploaded: (fileData) => {
							results.part_pictures = [
								...(results.part_pictures || []),
								fileData.src,
							];
						},
						onCompletion: () => {},
						onError: (file, message) => toast.error(`${file.name}: ${message}`),
					})();
					resolve(signedURLs);
				})
			);
		}
		await Promise.all(uploadPromises);
		return results;
	};

	const formSchema = useMemo(
		() =>
			SCHEMA__PartOrderForm({
				makeLoader,
				variantLoader,
				yearLoader,
				garageLoader,
				handleMakeChange,
				handleVariantChange,
				isVariantDisabled: !dependencies.makeId,
				isYearDisabled: !dependencies.variantId,
				updatePage,
			}),
		[makeLoader, variantLoader, yearLoader, dependencies]
	);

	const supabase = createClient();

	const onSubmit = async (formData) => {
		setPayloadPosting(true);
		setFormMessage(null);
		try {
			const uploadedData = await handleFileUploads(formData);
			if (
				!uploadedData.mulkiya_chassis &&
				(!uploadedData.part_pictures || uploadedData.part_pictures.length === 0)
			) {
				throw new Error(
					"No images uploaded. Please upload at least one image."
				);
			}
			const payloadToCreateOrder = {
				part_name: formData.part_name,
				vehicle_make: formData.make.label,
				garage: formData.garage_name.value,
				parts_images: uploadedData?.part_pictures,
				variant: formData.variant.label,
				model: formData.model_year.label,
				chassis_pic: [uploadedData?.mulkiya_chassis],
				status: purchaserStatus.OPEN,
			};
			if (
				!payloadToCreateOrder.parts_images?.length &&
				!payloadToCreateOrder.chassis_pic?.length
			) {
				throw new Error("Image upload failed. Please try again.");
			}
			const { data, error } = await supabase
				.from("orders")
				.insert([payloadToCreateOrder])
				.select();
			if (error) {
				throw new Error(`Error: ${error.message}`);
			}
			setPayloadPosting(false);
			setFormMessage({
				type: "success",
				message: "Order created successfully.",
			});
			setTimeout(() => {
				router.push("/");
			}, 1000);
		} catch (error) {
			console.error("❌ Order Submission Error:", error);
			setPayloadPosting(false);
			setFormMessage({
				type: "error",
				message: error.message,
			});
		} finally {
		}
	};

	return (
		<div className={"overflow-y-scroll h-[100%]"}>
			<Bounded className='b__auth__variant01 b__size-sm u__background-light '>
				<Container>
					<AddGarageFormModal
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
					/>
					<div className='flex flex-row-reverse mb-4'>
						<Button
							actionable={true}
							title={`Add Garage`}
							onClick={() => setIsModalOpen(true)}
						/>
					</div>
					<div className='mx-auto'>
						<AuthCard heading={`Create Order`} description={null}>
							<Form
								isValid={isValid}
								formFields={formSchema}
								register={register}
								errors={errors}
								control={control}
								buttonTitle={`Save`}
								onSubmit={handleSubmit(onSubmit)}
								payloadPosting={payloadPosting}
								formMessage={formMessage}
							/>
						</AuthCard>
					</div>
				</Container>
			</Bounded>
		</div>
	);
};

export default CreateOrderForm;
