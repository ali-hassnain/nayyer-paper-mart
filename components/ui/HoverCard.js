import React, { useState, useRef } from "react";

export default function HoverCard({
	children, // The element that triggers the hover card.
	content, // The content to display in the hover card.
	delay = 600, // Delay (in ms) before showing the card.
	leaveDelay = 500, // Delay (in ms) before hiding the card.
	className = "", // Additional classes for the wrapper.
	contentClassName = "", // Additional classes for the content container.
}) {
	const [hovered, setHovered] = useState(false);
	const enterTimeout = useRef(null);
	const leaveTimeout = useRef(null);

	const handleMouseEnter = () => {
		if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
		if (!hovered) {
			enterTimeout.current = setTimeout(() => {
				setHovered(true);
			}, delay);
		}
	};

	const handleMouseLeave = () => {
		if (enterTimeout.current) clearTimeout(enterTimeout.current);
		if (hovered) {
			leaveTimeout.current = setTimeout(() => {
				setHovered(false);
			}, leaveDelay);
		}
	};

	return (
		<div
			className={`relative ${className}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{children}
			{hovered && (
				<div
					className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-4 bg-white shadow border border-gray-200 rounded z-50 ${contentClassName}`}
				>
					{content}
				</div>
			)}
		</div>
	);
}
