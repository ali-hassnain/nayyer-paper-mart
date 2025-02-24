import Link from "next/link";
import React from "react";
import parse from "html-react-parser";

const Button = ({
	title = "",
	destination = "#",
	icon,
	iconPosition = "after",
	target = "_self",
	className = "",
	linkClassName = "",
	theme = "primary",
	size = "default",
	actionable = false,
	type = "button",
	onClick,
	isLoading = false,
	isDisabled = false,
}) => {
	if (!title) return null; // Prevent rendering if no title

	const buttonClass = `c__button c__button--${theme} 
    ${icon ? "c__button--has-icon" : ""}  
    ${
			iconPosition === "before"
				? "c__button--has-icon--prev"
				: "c__button--has-icon--after"
		}
    ${className} c__button__size--${size} 
    ${isLoading ? "c__button--loading" : ""} 
    ${isDisabled ? "c__button--disabled" : ""}`;

	return actionable ? (
		<button
			onClick={onClick}
			type={type}
			className={buttonClass}
			disabled={isDisabled} // Properly disabling button
		>
			<div className='c__button__content'>
				{icon && iconPosition === "before" && (
					<span className='c__button__icon'>{parse(icon)}</span>
				)}
				<span>{title}</span>
				{isLoading && (
					<span className='c__button__loading-icon'>
						<svg className='c__spinner' viewBox='0 0 50 50'>
							<circle
								className='path'
								cx='25'
								cy='25'
								r='20'
								fill='none'
								strokeWidth='5'
							></circle>
						</svg>
					</span>
				)}
			</div>
		</button>
	) : (
		<Link
			href={destination}
			target={target}
			className={`c__button__anchor-element ${linkClassName}`}
		>
			<span className={buttonClass}>
				<div className='c__button__content'>
					{icon && iconPosition === "before" && (
						<span className='c__button__icon'>{parse(icon)}</span>
					)}
					<span>{title}</span>
				</div>
			</span>
		</Link>
	);
};

export default Button;
