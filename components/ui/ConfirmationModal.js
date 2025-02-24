import Modal from "@/components/ui/Modal";

const ConfirmationModal = ({ message = "Are you sure?", ...rest }) => {
	return (
		<Modal
			{...rest}
			content={
				<div className='flex flex-col items-center justify-center space-y-4'>
					<p className='text-center text-gray-700'>{message}</p>
				</div>
			}
		/>
	);
};

export default ConfirmationModal;
