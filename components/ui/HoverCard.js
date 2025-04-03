"use client";
import React, { useState, useRef } from "react";

export default function HoverCard({
	children,
	content,
	delay = 200,
	leaveDelay = 150,
	className = "",
	contentClassName = "",
}) {
	const [isVisible, setIsVisible] = useState(false);
	const timeoutRef = useRef(null);

	const showCard = () => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
	};

	const hideCard = () => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setIsVisible(false), leaveDelay);
	};

	return (
		<div
			className={`relative inline-block ${className}`}
			onMouseEnter={showCard}
			onMouseLeave={hideCard}
		>
			{children}
			{isVisible && (
				<div
					className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            bg-white shadow-lg border border-gray-200 rounded-md z-[1000]
            animate-fade-in-up ${contentClassName}`}
				>
					<div className='relative p-2 text-sm text-gray-600'>
						{content}
						<div
							className='absolute top-full left-1/2 -translate-x-1/2
              w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45
              -mt-1'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
