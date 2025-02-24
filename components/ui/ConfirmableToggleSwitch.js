import { useState } from "react";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const ConfirmableToggleSwitch = ({
	id,
	label,
	apiCall,
	size = "default",
	confirmationMessage = "",
	defaultChecked = false,
}) => {
	const [isChecked, setIsChecked] = useState(defaultChecked);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	// This function is called when the toggle is clicked.
	// It only opens the confirmation modal instead of changing the checked state.
	const handleToggle = () => {
		if (!isChecked) {
			setIsOpen(true);
		}
	};

	// Handle confirmation: call the API and update state only if successful.
	const handleConfirm = async () => {
		setIsOpen(false);
		setIsLoading(true);
		try {
			await apiCall();
			setIsChecked(true); // Update checked state only upon success
			// setIsDisabled(true); // Optionally disable further changes
		} catch (error) {
			console.error("API call failed", error);
		} finally {
			setIsLoading(false);
		}
	};

	// On cancel or close, simply close the modal without updating state.
	const handleCancel = () => {
		setIsOpen(false);
	};

	return (
		<div>
			<ToggleSwitch
				id={id}
				label={label}
				checked={isChecked}
				onChange={handleToggle}
				disabled={isDisabled || isLoading}
				size={size}
			/>
			<ConfirmationModal
				message={confirmationMessage}
				isOpen={isOpen}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				onClose={handleCancel}
			/>
		</div>
	);
};

export default ConfirmableToggleSwitch;
