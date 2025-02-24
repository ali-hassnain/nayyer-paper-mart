"use client";
import React from "react";
import parse from "html-react-parser";
import Button from "@/components/ui/Button";
import MapWithPlacesField from "@/components/ui/MapWithPlacesField";
import AreaSearch from "./AreaSearch";
import { Controller } from "react-hook-form";
import { AsyncPaginate } from "react-select-async-paginate";
import FileUploader from "@/components/ui/FileUploader";

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
																	required: required
																		? required.message
																		: required,
																	pattern: pattern || null,
																})}
															></textarea>
														);
													case "text":
													case "email":
													case "password":
													case "number":
													case "date":
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
																	required: required
																		? required.message
																		: required,
																	pattern: pattern || null,
																})}
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
																	required: required
																		? required.message
																		: required,
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
																	required: required?.value || false,
																	validate: (value) => {
																		if (
																			required?.value &&
																			(!value || value.length === 0)
																		) {
																			return required.message;
																		}
																		return true;
																	},
																}}
																render={({ field, fieldState }) => (
																	<div className='c__form__field'>
																		<FileUploader
																			onValueChange={(files) =>
																				field.onChange(files)
																			}
																			multiple={elem.multiple}
																			maxFileCount={elem.multiple ? 10 : 1}
																			required={required?.value}
																			bucketName={elem.bucketName}
																		/>
																		{fieldState.error && (
																			<div className='c__form__error'>
																				{fieldState.error.message}
																			</div>
																		)}
																	</div>
																)}
															/>
														);
													// case "image":
													//     return (
													//         <input
													//             className={`c__form__input ${
													//                 errors[name] ? `c__form__input--error` : ``
													//             }`}
													//             name={name}
													//             type="file"
													//             accept="image/*"
													//             {...register(name, {
													//                 required: required ? required.message : required,
													//             })}
													//         />
													//     );
													case "map":
														return (
															<Controller
																name={name}
																control={control}
																rules={{
																	required: required
																		? required.message
																		: required,
																	pattern: pattern || null,
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
													// case "map":
													//     return(
													//         <MapWithPlacesField
													//             className={`c__form__input ${
													//             errors[name] ? `c__form__input--error` : ``
													//         }`}
													//             name={name}
													//             placeholder={placeholder}
													//             defaultValue={defaultValue || ""}
													//             {...register(name, {
													//                 required: required ? required.message : required,
													//                 pattern: pattern || null,
													//             })}/>
													//     )
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
																	required: required
																		? required.message
																		: required,
																	pattern: pattern || null,
																})}
															/>
														);
													case "async-paginate":
														return (
															<Controller
																name={name}
																control={control}
																rules={{
																	required: required
																		? required.message
																		: required,
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
						<div className={`c__form__button - wrapper`}>
							<Button
								actionable
								title={buttonTitle}
								type='submit'
								isLoading={payloadPosting}
								// isDisabled={!isValid}
								className={`${buttonClass}`}
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
