export const SCHEMA__DummyMenu = {
	title: "Header",
	_originalId: "1d800887-ce2d-4a02-8c16-5e4f6bc2675c",
	_updatedAt: "2024-08-31T00:11:29Z",
	items: [
		// {
		//   _key: "d1ecc52f07b6",
		//   title: "My Orders",
		//   _type: "link_list",
		//   destination: `/orders/${user?.id}`,
		// },
		// {
		//   _type: "link_list",
		//   destination: "/upload",
		//   _key: "a3fd00ca0cca33f99124c385ea2ca1e6",
		//   title: "Upload",
		// },
	],
};

export const SCHEMA__LoginForm = [
	{
		name: `email`,
		label: `Email Address`,
		placeholder: `Email Address`,
		width: 100,
		type: "email",
		required: {
			value: true,
			message: `Must enter a valid email`,
		},
		pattern: {
			value:
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			message: `Must enter a valid email`,
		},
	},
];

export const SCHEMA__SignupForm = [
	{
		name: `first_name`,
		label: `First Name`,
		placeholder: `First Name`,
		width: 50,
		type: "text",
		pattern: {
			value: /^[a-zA-Z]+$/,
			message: `Must only be alphabets`,
		},
		required: {
			value: true,
			message: `This field is required`,
		},
	},
	{
		name: `last_name`,
		label: `Last Name`,
		placeholder: `Last Name`,
		width: 50,
		type: "text",
		pattern: {
			value: /^[a-zA-Z]+$/,
			message: `Must only be alphabets`,
		},
		required: {
			value: true,
			message: `This field is required`,
		},
	},
	{
		name: `email`,
		label: `Email Address`,
		placeholder: `Email Address`,
		width: 100,
		type: "email",
		required: {
			value: true,
			message: `Must enter a valid email`,
		},
		pattern: {
			value:
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			message: `Must enter a valid email`,
		},
	},
	{
		name: `username_handle`,
		label: `Username Handle`,
		placeholder: `Username Handle`,
		width: 100,
		type: "text",
		required: {
			value: true,
			message: `This field is required`,
		},
		pattern: {
			value: /^[a-zA-Z0-9_-]+$/,
			message: `Must be alphanumeric`,
		},
	},
];

export const SCHEMA__ImageEditorForm = [
	{
		name: `title`,
		label: `Image Title (Required)`,
		placeholder: ``,
		width: 100,
		type: "text",
		required: {
			value: true,
			message: `This field is required`,
		},
		pattern: {
			value: /^[a-zA-Z\s]+$/,
			message: `Must only be alphabets`,
		},
	},
	{
		name: `description`,
		label: `Short Description (Optional)`,
		placeholder: ``,
		width: 100,
		type: "textarea",
		pattern: {
			value: /^[\s\S]{0,130}$/,
			message: `Must be less than 130 characters`,
		},
	},
];

export const SCHEMA__PartOrderForm = ({
	makeLoader,
	variantLoader,
	yearLoader,
	garageLoader,
	handleMakeChange,
	handleVariantChange,
	isVariantDisabled,
	isYearDisabled,
	updatePage,
}) => [
	{
		name: `part_name`,
		label: `Part Name`,
		placeholder: `Enter part name`,
		width: 100,
		type: "text",
		pattern: {
			value: /^[a-zA-Z0-9\s]+$/,
			message: `Must only contain letters, numbers, and spaces`,
		},
		required: {
			value: true,
			message: `This field is required`,
		},
	},
	{
		name: "make",
		label: "Make and Model",
		type: "async-paginate",
		loadOptions: makeLoader,
		additional: { page: 1 },
		onChange: handleMakeChange,
		width: 50,
		required: {
			value: true,
			message: "Make selection is required",
		},
		handlePagination: () => updatePage("makes"),
	},
	{
		name: "variant",
		label: "Variant",
		type: "async-paginate",
		loadOptions: variantLoader,
		additional: { page: 1 },
		isDisabled: isVariantDisabled,
		onChange: handleVariantChange,
		width: 50,
		required: {
			value: true,
			message: "Variant selection is required",
		},
		handlePagination: () => updatePage("variants"),
	},
	{
		name: "model_year",
		label: "Model Year",
		type: "async-paginate",
		loadOptions: yearLoader,
		additional: { page: 1 },
		isDisabled: isYearDisabled,
		width: 50,
		required: {
			value: true,
			message: "Model year selection is required",
		},
		handlePagination: () => updatePage("model_years"),
	},
	{
		name: "garage_name",
		label: "Garage Name",
		type: "async-paginate",
		loadOptions: garageLoader,
		additional: { page: 1 },
		width: 100,
		placeholder: "Search for garages...",
		required: {
			value: false, // Adjust based on your requirements
			message: "Garage selection is required",
		},
		handlePagination: () => updatePage("garages"),
	},
	{
		name: `mulkiya_chassis`,
		label: `Mulkiya/Chassis`,
		type: "image",
		bucketName: "mulkiya",
		multiple: false,
		required: true,
	},
	{
		name: `part_pictures`,
		label: `Part Pictures`,
		type: "file",
		bucketName: "request-images",
		multiple: true,
		required: true,
	},
];

export const SCHEMA__AddGarageForm = [
	{
		name: "garageName",
		label: "Garage Name",
		placeholder: "Enter Garage Name",
		width: 100,
		type: "text",
		required: {
			value: true,
			message: "Garage Name is required",
		},
	},
	{
		name: "contactPersonName",
		label: "Contact Person Name",
		placeholder: "Enter Contact Person Name",
		width: 100,
		type: "text",
		required: {
			value: true,
			message: "Contact Person Name is required",
		},
	},
	{
		name: "contactPersonNumber",
		label: "Contact Person Number",
		placeholder: "Enter Contact Person Number",
		width: 100,
		type: "text",
		required: {
			value: true,
			message: "Contact Person Number is required",
		},
		pattern: {
			value: /^(\+971|0)?5[0245689][0-9]{7}$/,
			message:
				"Enter a valid UAE mobile number (e.g., 0501234567 or +971501234567)",
		},
	},
	{
		name: "mapPinLocation",
		label: "Garage Pin Location / Search Garage",
		placeholder: "Select Location on Map",
		width: 100,
		type: "map",
		required: {
			value: true,
			message: "Map Pin Location is required",
		},
	},
];

export const SCHEMA__RejectReasonForm = [
	{
		name: `reason`,
		label: `Select Reason`,
		placeholder: `Choose a reason`,
		width: 100,
		type: "select",
		options: [
			{ label: "High Price", value: "high_price" },
			{ label: "Do Not Need Anymore", value: "do_not_need" },
			{ label: "Other", value: "other" },
		],
		required: {
			value: true,
			message: `Please select a reason`,
		},
	},
	{
		name: `comment`,
		label: `Comment`,
		placeholder: `Enter details...`,
		width: 100,
		type: "text",
	},
];

export const SCHEMA__SendQuotationForm = [
	{
		name: `quote_price`,
		label: `Price of Part`,
		placeholder: `Enter Part Price`,
		width: 100,
		type: "number",
		required: {
			value: true,
			message: `Price is required`,
		},
		min: {
			value: 0,
			message: `Price must be at least 0`,
		},
	},
	{
		name: `quote_pictures`,
		label: `Part Pictures`,
		placeholder: `Upload Part Pictures`,
		type: "file",
		width: 100,
		bucketName: "request-images",
		multiple: true,
		required: {
			value: true,
			message: `At least one image is required`,
		},
	},
];
