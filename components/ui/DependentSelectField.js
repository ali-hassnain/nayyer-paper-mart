"use client";
import React, { useEffect, useState } from "react";

const DependentSelect = ({
	name,
	label,
	placeholder,
	dependencyValue,
	fetchOptions,
	onChange,
	value,
	disabled,
	errors,
}) => {
	const [options, setOptions] = useState([]);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const loadOptions = async (page = 1) => {
		setIsLoading(true);
		// fetchOptions should be an async function passed in as a prop
		// that accepts dependencyValue, search, page, etc.
		const fetched = await fetchOptions({ dependencyValue, search, page });
		setOptions(fetched);
		setIsLoading(false);
	};

	// When dependency changes, clear options
	useEffect(() => {
		setOptions([]);
		onChange(""); // reset the value in the parent form if dependency changes
	}, [dependencyValue]);

	return (
		<div className='dependent-select'>
			{label && <label htmlFor={name}>{label}</label>}
			<input
				type='text'
				placeholder='Search...'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				onBlur={() => loadOptions()} // or call onFocus to trigger search
			/>
			<select
				name={name}
				value={value}
				disabled={disabled || !dependencyValue}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value=''>{placeholder || "Select an option"}</option>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			{isLoading && <p>Loading...</p>}
			{errors && errors[name] && (
				<div className='error'>{errors[name].message}</div>
			)}
		</div>
	);
};

export default DependentSelect;
