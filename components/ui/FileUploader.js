"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { formatBytes } from "../../lib/helpers";
import Container from "@/components/wrappers/Container";
import { toast } from "sonner";

const FileUploader = ({
	onValueChange,
	accept = { "image/*": [] },
	maxSize = 1024 * 1024 * 4,
	maxFileCount = 5,
	multiple = false,
	disabled = false,
	required = false,
	bucketName,
}) => {
	const [files, setFiles] = useState([]);

	const onDrop = useCallback(
		(acceptedFiles, rejectedFiles) => {
			if (!multiple && acceptedFiles.length > 1) {
				toast.error("Cannot upload more than 1 file at a time");
				return;
			}

			if (files.length + acceptedFiles.length > maxFileCount) {
				toast.error(`Maximum ${maxFileCount} files allowed`);
				return;
			}

			const newFiles = acceptedFiles.map((file) =>
				Object.assign(file, { preview: URL.createObjectURL(file) })
			);

			const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
			setFiles(updatedFiles);
			onValueChange?.(updatedFiles);

			rejectedFiles.forEach(({ file }) => {
				toast.error(`Rejected ${file.name}: Unsupported format or too large`);
			});
		},
		[files, maxFileCount, multiple, onValueChange]
	);

	const onRemove = useCallback(
		(index) => {
			const newFiles = files.filter((_, i) => i !== index);
			setFiles(newFiles);
			onValueChange?.(newFiles);
		},
		[files, onValueChange]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept,
		maxSize,
		onDrop,
		multiple,
		disabled,
	});

	useEffect(() => {
		return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
	}, [files]);

	return (
		<Container className='mt-[2.5rem]'>
			<div className='max-w-[800px] mx-auto'>
				<div className='relative flex flex-col gap-6 overflow-hidden px-4'>
					<div
						{...getRootProps()}
						className={cn(
							"group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
							"ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							isDragActive && "border-muted-foreground/50",
							disabled && "pointer-events-none opacity-60"
						)}
					>
						<input {...getInputProps()} />
						<div className='flex flex-col items-center justify-center gap-4 sm:px-5'>
							<div className='rounded-full border border-dashed p-3'>
								<Upload className='size-7 text-muted-foreground' />
							</div>
							<p className='font-medium text-muted-foreground'>
								{isDragActive
									? "Drop files here"
									: "Drag & drop or click to select"}
							</p>
							<p className='text-sm text-muted-foreground/70'>
								{`${
									multiple ? "Multiple" : "Single"
								} file upload, max ${formatBytes(maxSize)}`}
							</p>
						</div>
					</div>

					{files.length > 0 && (
						<div className='mt-10'>
							<ScrollArea className='h-fit w-full px-4'>
								<div className='flex flex-col gap-4 max-h-48'>
									{files.map((file, index) => (
										<div
											key={index}
											className='relative flex items-center gap-3.5'
										>
											<div className='flex flex-1 gap-2.5'>
												<Image
													src={file.preview}
													alt={file.name}
													width={48}
													height={48}
													className='aspect-square shrink-0 rounded-md object-cover'
												/>
												<div className='flex w-full flex-col gap-2'>
													<div className='flex flex-col gap-px'>
														<p className='line-clamp-1 text-sm font-medium text-foreground/80'>
															{file.name}
														</p>
														<p className='text-xs text-muted-foreground'>
															{formatBytes(file.size)}
														</p>
													</div>
												</div>
												<button
													type='button'
													className='c__util-button h-[35px]'
													onClick={() => onRemove(index)}
												>
													<X className='size-4' aria-hidden='true' />
													<span className='sr-only'>Remove file</span>
												</button>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>
					)}
				</div>
			</div>
		</Container>
	);
};

export default FileUploader;
