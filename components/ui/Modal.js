import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

const Modal = ({
	title = "Default Title",
	content = "Default content goes here.",
	isOpen = false,
	onClose = () => {},
	onConfirm = () => {},
	onCancel = () => {},
	showActionButtons = true,
}) => {
	const [modalOpen, setModalOpen] = useState(isOpen);

	useEffect(() => {
		setModalOpen(isOpen);
	}, [isOpen]);

	const closeModal = () => {
		setModalOpen(false);
		onClose();
	};

	return (
		<>
			{modalOpen && (
				<div className='fixed top-0 left-0 z-[99] flex items-center justify-center w-screen h-screen'>
					<div
						onClick={closeModal}
						className='absolute inset-0 w-full h-full bg-white backdrop-blur-sm bg-opacity-70'
					></div>
					<div className='relative w-full py-6 bg-white border shadow-lg px-7 border-neutral-200 sm:max-w-lg sm:rounded-lg'>
						<div className='flex items-center justify-between pb-3'>
							<h3 className='text-lg font-semibold'>{title}</h3>
							<button
								onClick={closeModal}
								className='absolute top-0 right-0 flex items-center justify-center w-8 h-8 mt-5 mr-5 text-gray-600 rounded-full hover:text-gray-800 hover:bg-gray-50'
							>
								<svg
									className='w-5 h-5'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth='1.5'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>
						<div className='relative w-auto pb-8'>{content}</div>
						{showActionButtons && (
							<div className='flex  justify-end space-x-2'>
								<Button
									actionable={true}
									onClick={() => {
										closeModal();
										onCancel();
									}}
									type='button'
									className='inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-100 focus:ring-offset-2'
									title={"Cancel"}
								/>
								<Button
									actionable={true}
									onClick={() => {
										closeModal();
										onConfirm();
									}}
									type='button'
									className='inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 bg-neutral-950 hover:bg-neutral-900'
									title={"Continue"}
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default Modal;
