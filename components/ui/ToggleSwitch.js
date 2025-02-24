import React from "react";

const ToggleSwitch = ({
	id,
	label,
	checked,
	onChange,
	disabled = false,
	size = "default",
}) => {
	return (
		<div className='flex items-center space-x-2'>
			{/* Hidden input for accessibility */}
			<input
				id={id}
				type='checkbox'
				className='hidden'
				checked={checked}
				readOnly
			/>

			{/* Toggle Button */}
			<button
				type='button'
				onClick={onChange}
				className={`relative inline-flex h-6 w-10 py-0.5 ml-4 focus:outline-none rounded-full transition-all duration-200 ${
					checked ? "bg-blue-600" : "bg-neutral-200"
				} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
			>
				<span
					className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
						checked ? "translate-x-[18px]" : "translate-x-0.5"
					}`}
				></span>
			</button>

			{/* Label */}
			<label
				htmlFor={id}
				onClick={onChange}
				className={`text-sm select-none cursor-pointer ${
					checked ? "text-blue-600" : "text-gray-400"
				} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				{label}
			</label>
		</div>
	);
};

export default ToggleSwitch;
