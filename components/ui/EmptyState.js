const EmptyState = ({
	title = "No Data Available",
	description = "It looks like there's nothing here yet.",
	icon = null,
	actionText = "Reload",
	onAction = null,
}) => {
	return (
		<div className='flex flex-col items-center justify-center py-12 text-center'>
			{icon && <div className='mb-4 text-gray-400'>{icon}</div>}
			<h2 className='text-lg font-semibold text-gray-700'>{title}</h2>
			<p className='mt-2 text-sm text-gray-500'>{description}</p>
			{onAction && (
				<button
					onClick={onAction}
					className='mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
				>
					{actionText}
				</button>
			)}
		</div>
	);
};

export default EmptyState;
