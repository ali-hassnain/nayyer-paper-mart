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

export const SCHEMA__AddCustomerForm = [
	{
		name: "business_name",
		label: "Business Name",
		type: "text",
		width: "full",
		required: { value: true, message: "Business name is required" },
		placeholder: "Enter business name",
	},
	{
		name: "contact_name",
		label: "Person Name",
		type: "text",
		width: "full",
		required: { value: true, message: "Contact name is required" },
		placeholder: "Enter contact person's name",
	},
	{
		name: "business_contact",
		label: "Contact Number",
		type: "text",
		width: "full",
		required: { value: true, message: "Contact number is required" },
		placeholder: "0300 1234567",
		pattern: {
			value: /^(\+92|0)3[0-9]{9}$/,
			message: "Invalid Pakistani mobile number",
		},
	},
	{
		name: "email",
		label: "Email Address",
		type: "email",
		width: "full",
		placeholder: "example@domain.com",
		pattern: {
			value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
			message: "Invalid email address",
		},
	},
	{
		name: "customer_type",
		label: "Customer Type",
		type: "select",
		width: "full",
		required: { value: true, message: "Customer type is required" },
		options: [
			{ value: "buyer", label: "Buyer" },
			{ value: "supplier", label: "Supplier" },
		],
	},
	{
		name: "city",
		label: "City",
		type: "text",
		width: "half",
		required: { value: true, message: "City is required" },
	},
	{
		name: "country",
		label: "Country",
		type: "text",
		width: "half",
		required: { value: true, message: "Country is required" },
	},
	{
		name: "address",
		label: "Business Address",
		type: "textarea",
		width: "full",
		placeholder: "Enter full business address",
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

export const SCHEMA__PaymentFormSchema = (userBalance, partnerBalance) => [
	{
		name: "payment_amount",
		label: "Payment Amount",
		type: "number",
		placeholder: `Enter Payment Amount`,
		required: {
			value: true,
			message: "Payment amount is required",
		},
	},
	{
		name: "payment_mode",
		label: "Payment Mode",
		type: "select",
		options: [
			{ value: "cash", label: "Cash" },
			{ value: "bank_transfer", label: "Bank Transfer" },
			{ value: "cheque", label: "Cheque" },
			{ value: "jazz_cash", label: "Jazz Cash" },
		],
		required: {
			value: true,
			message: "Payment mode is required",
		},
	},
	{
		name: "payment_date",
		label: "Payment Date",
		type: "date",
		required: {
			value: true,
			message: "Payment date is required",
		},
	},
	{
		name: "payment_proof",
		label: "Payment Proof",
		type: "file",
	},
];
