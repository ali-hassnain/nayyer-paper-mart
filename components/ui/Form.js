"use client";
import React from "react";
import parse from "html-react-parser";
import Button from "@/components/ui/Button";
import MapWithPlacesField from "@/components/ui/MapWithPlacesField";
import AreaSearch from "./AreaSearch";
import { Controller } from "react-hook-form";
import { AsyncPaginate } from "react-select-async-paginate";
import FileUploader from "@/components/ui/FileUploader";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';


const Form = ({
	formFields,
	register,
	errors,
	control,
	onSubmit,
	payloadPosting,
	formMessage,
	buttonTitle,
	disableSubmissionOnEnter,
	buttonClass = "",
}) => {
	const checkKeyDown = (e) => {
		if (e.key === "Enter") e.preventDefault();
	};

	return (
		<div className='c__form'>
			{formFields && Array.isArray(formFields) ? (
				<form
					onSubmit={onSubmit}
					autoComplete='off'
					onKeyDown={disableSubmissionOnEnter ? (e) => checkKeyDown(e) : null}
				>
					<div className='c__form__fields-wrapper'>
						{formFields.map((elem) => {
							const {
								name,
								label,
								placeholder,
								type,
								width,
								required,
								pattern,
								defaultValue,
								options,
								disabled = false,
							} = elem;

							return (
								<div
									key={name}
									className={`c__form__fieldset c__form__fieldset--${width} ${
										type === "hidden" ? `c__form__fieldset--hidden` : ``
									}`}
								>
									<div className='c__form__field'>
										{label && (
											<label className='c__form__label'>
												{label}
												{required?.value && (
													<span className='text-red-500'>*</span>
												)}
											</label>
										)}
										<div className='c__form__input-wrapper'>
											{(() => {
												switch (type) {
													case "textarea":
														return (
															<textarea
																className={`c__form__input ${
																	errors[name] ? `c__form__input--error` : ``
																}`}
																name={name}
																placeholder={placeholder}
																defaultValue={defaultValue || ""}
																{...register(name, {
																	required: required?.value
																		? required.message
																		: false,
																	pattern: pattern?.value
																		? {
																				value: new RegExp(pattern.value),
																				message: pattern.message,
																		  }
																		: undefined,
																	validate: elem.validate,
																})}
															></textarea>
														);
													case "text":
													case "email":
													case "password":
														return (
															<input
																className={`c__form__input ${
																	errors[name] ? `c__form__input--error` : ``
																}`}
																name={name}
																type={type}
																placeholder={placeholder}
																defaultValue={defaultValue || ""}
																{...register(name, {
																	required: required?.value
																		? required.message
																		: false,
																	pattern: pattern?.value
																		? {
																				value: new RegExp(pattern.value),
																				message: pattern.message,
																		  }
																		: undefined,
																	validate: elem.validate,
																})}
																disabled={disabled}
															/>
														);
													case "date":
													case "datetime":
														return (
															<Controller
																name={name}
																control={control}
																defaultValue={defaultValue || new Date()}
																rules={{
																	required: required?.value ? required.message : false,
																	validate: elem.validate,
																}}
																render={({ field }) => (
																	<DatePicker
																		selected={field.value || new Date()}
																		onChange={(date) => field.onChange(date)}
																		showTimeSelect
																		timeFormat="HH:mm"
																		timeIntervals={15}
																		timeCaption="Time"
																		dateFormat="MMMM d, yyyy h:mm aa"
																		className={`c__form__input ${
																			errors[name] ? `c__form__input--error` : ``
																		}`}
																		placeholderText={placeholder}
																		maxDate={new Date()}
																		popperClassName="react-datepicker-popper"
																		wrapperClassName="date-picker-wrapper"
																		disabled={disabled}
																	/>
																)}
															/>
														);
													case "number":
														return (
															<input
																className={`c__form__input ${
																	errors[name] ? `c__form__input--error` : ``
																}`}
																name={name}
																type='number'
																placeholder={placeholder}
																step={elem.step || "1"} // Default to step=1 if not specified
																inputMode={elem.inputMode || "decimal"}
																pattern={elem.pattern || "^\\d+(\\.\\d{0,2})?$"} // Allow up to 2 decimals
																defaultValue={
																	defaultValue
																		? Number(defaultValue).toFixed(2)
																		: ""
																}
																{...register(name, {
																	required: required?.value
																		? required.message
																		: false,
																	pattern: {
																		value: new RegExp(
																			elem.pattern || "^\\d+(\\.\\d{0,2})?$"
																		),
																		message:
																			elem.pattern?.message ||
																			"Maximum 2 decimal places allowed",
																	},
																	validate: elem.validate,
																	valueAsNumber: true,
																	min: elem.min?.value
																		? {
																				value: elem.min.value,
																				message: elem.min.message,
																		  }
																		: undefined,
																	max: elem.max?.value
																		? {
																				value: elem.max.value,
																				message: elem.max.message,
																		  }
																		: undefined,
																})}
																disabled={disabled}
																onKeyDown={(e) => {
																	// Allow numbers, single decimal point, and control keys
																	if (
																		!/[0-9]|\.|Backspace|Delete|Arrow/.test(
																			e.key
																		)
																	) {
																		e.preventDefault();
																	}
																	// Prevent multiple decimal points
																	if (
																		e.key === "." &&
																		e.currentTarget.value.includes(".")
																	) {
																		e.preventDefault();
																	}
																}}
															/>
														);
													case "select":
														return (
															<select
																className={`c__form__input ${
																	errors[name] ? `c__form__input--error` : ``
																}`}
																name={name}
																{...register(name, {
																	required: required?.value
																		? required.message
																		: false,
																	pattern: pattern?.value
																		? {
																				value: new RegExp(pattern.value),
																				message: pattern.message,
																		  }
																		: undefined,
																	validate: elem.validate,
																})}
															>
																<option value=''>Select an option</option>
																{options &&
																	options.map((option) => (
																		<option
																			key={option.value}
																			value={option.value}
																		>
																			{option.label}
																		</option>
																	))}
															</select>
														);
													case "image":
													case "file":
														return (
															<Controller
																name={name}
																control={control}
																rules={{
																	required: required?.value
																		? required.message
																		: false,
																	validate: elem.validate,
																}}
																render={({ field }) => {
																	return (
																		<div className='c__form__field'>
																			<FileUploader
																				onValueChange={(files) => {
																					field.onChange(files);
																				}}
																				multiple={elem.multiple}
																				maxFileCount={elem.multiple ? 10 : 1}
																				required={required?.value}
																				accept={elem.accept}
																				bucketName={elem.bucketName}
																			/>
																		</div>
																	);
																}}
															/>
														);
													case "map":
														return (
															<Controller
																name={name}
																control={control}
																rules={{
																	required: required?.value
																		? required.message
																		: false,
																	pattern: pattern?.value
																		? {
																				value: new RegExp(pattern.value),
																				message: pattern.message,
																		  }
																		: undefined,
																	validate: elem.validate,
																}}
																render={({ field: { onChange, value } }) => (
																	<MapWithPlacesField
																		className={`c__form__input ${
																			errors[name]
																				? `c__form__input--error`
																				: ``
																		}`}
																		name={name}
																		placeholder={placeholder}
																		value={value}
																		onChange={onChange}
																	/>
																)}
															/>
														);
													case "area-search":
														return (
															<AreaSearch
																className={`c__form__input ${
																	errors[name] ? `c__form__input--error` : ``
																}`}
																name={name}
																placeholder={placeholder}
																defaultValue={defaultValue || ""}
																{...register(name, {
																	required: required?.value
																		? required.message
																		: false,
																	pattern: pattern?.value
																		? {
																				value: new RegExp(pattern.value),
																				message: pattern.message,
																		  }
																		: undefined,
																	validate: elem.validate,
																})}
															/>
														);
													case "async-paginate":
														return (
															<Controller
																name={name}
																control={control}
																rules={{
																	required: required?.value
																		? required.message
																		: false,
																	validate: elem.validate,
																}}
																render={({ field }) => (
																	<AsyncPaginate
																		{...field}
																		key={`${name}-${
																			elem.additional?.parentId || "initial"
																		}`}
																		loadOptions={elem.loadOptions}
																		additional={elem.additional}
																		isDisabled={elem.isDisabled}
																		onMenuScrollToBottom={elem.handlePagination}
																		onChange={(selectedOption, actionMeta) => {
																			field.onChange(selectedOption);
																			if (elem.onChange)
																				elem.onChange(selectedOption);
																		}}
																		isClearable={true}
																		value={field.value}
																		inputValue={field.inputValue}
																		classNamePrefix='react-select'
																		className={`c__form__input ${
																			errors[name]
																				? "c__form__input--error"
																				: ""
																		}`}
																		menuPortalTarget={document.body}
																		styles={{
																			menuPortal: (base) => ({
																				...base,
																				zIndex: 9999,
																			}),
																		}}
																	/>
																)}
															/>
														);
													default:
														return null;
												}
											})()}
										</div>
									</div>
									{errors[name] && (
										<div id={`${name}-error`} className='c__form__error'>
											<span>{errors[name].message}</span>
										</div>
									)}
								</div>
							);
						})}
					</div>
					{buttonTitle && (
						<div className='sticky bottom-[-16px] bg-white z-10 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
							<Button
								actionable
								title={buttonTitle}
								type='submit'
								isLoading={payloadPosting}
								className={`${buttonClass} w-full`}
							/>
						</div>
					)}
					{formMessage && (
						<div
							className={`c__form__message c__form__message--${formMessage.type}`}
						>
							{parse(formMessage.message)}
						</div>
					)}
				</form>
			) : (
				<div className={`c__form__message c__form__message--error`}>
					Error rendering the form. <br />
					Please check form fields are set up correctly
				</div>
			)}
		</div>
	);
};

export default Form;
