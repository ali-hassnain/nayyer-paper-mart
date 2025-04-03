import React, { useState, useRef, useEffect } from "react";

const Tabs = ({
	defaultIndex = 0,
	tabs = [],
	contentHeight = "300px",
	activeIndex,
	setActiveIndex,
}) => {
	const tabButtonsRef = useRef([]);
	const markerRef = useRef(null);

	// Reposition the marker whenever activeIndex or tabs change
	useEffect(() => {
		repositionMarker(activeIndex);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeIndex, tabs]);

	const repositionMarker = (index) => {
		const button = tabButtonsRef.current[index];
		if (button && markerRef.current) {
			markerRef.current.style.width = `${button.offsetWidth}px`;
			markerRef.current.style.height = `${button.offsetHeight}px`;
			markerRef.current.style.left = `${button.offsetLeft}px`;
		}
	};

	const handleTabClick = (index) => {
		setActiveIndex(index);
	};

	return (
		<div className='relative w-full'>
			{/* Tab Buttons Container */}
			<div
				className='relative inline-grid items-center justify-center h-10 p-1 text-gray-500 bg-gray-100 rounded-lg select-none w-full'
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${tabs?.length}, 1fr)`,
				}}
			>
				{tabs?.map((tab, index) => (
					<button
						key={index}
						ref={(el) => (tabButtonsRef.current[index] = el)}
						onClick={() => handleTabClick(index)}
						type='button'
						className='relative z-20 inline-flex items-center justify-center w-full h-8 px-3 text-sm font-medium transition-all rounded-md cursor-pointer whitespace-nowrap'
					>
						{tab.label}
					</button>
				))}
				{/* Active Tab Marker */}
				<div
					ref={markerRef}
					className='absolute left-0 z-10 duration-300 ease-out'
					style={{ position: "absolute" }}
				>
					<div className='w-full h-full bg-white rounded-md shadow-sm'></div>
				</div>
			</div>

			{/* Tab Contents Container with fixed height */}
			<div
				className='relative w-full mt-2 content'
				style={{ height: contentHeight }}
			>
				{tabs?.map((tab, index) => (
					<div
						key={index}
						style={{
							display: activeIndex === index ? "block" : "none",
							height: "100%",
						}}
						className='relative'
					>
						{tab.content}
					</div>
				))}
			</div>
		</div>
	);
};

export default Tabs;
