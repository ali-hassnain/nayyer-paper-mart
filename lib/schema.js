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
		name: "user_payment_mode",
		label: "Payment Mode",
		type: "select",
		required: { value: true, message: "Payment mode is required" },
		options: [
			{ value: "cash", label: "Cash" },
			{ value: "cheque", label: "Cheque" },
			{ value: "bank_transfer", label: "Bank Transfer" },
		],
	},
	{
		step: 0.01,
		inputMode: "decimal",
		pattern: "^\\d+(\\.\\d{1,2})?$",
		name: "user_payment_amount",
		label: "Amount",
		type: "number",
		required: { value: true, message: "Amount is required" },
		defaultValue: userBalance,
		min: { value: 1, message: "Amount must be greater than 0" },
		max: {
			value: userBalance,
			message: "Cannot exceed your balance",
		},
	},
	{
		name: "user_payment_date",
		label: "User Payment Date & Time",
		type: "datetime",
		required: { value: true, message: "User Payment date is required" },
		defaultValue: new Date(),
		validate: (value) => {
			if (!value) return true;
			const selectedDate = new Date(value);
			const now = new Date();
			return selectedDate <= now || "Payment date cannot be in the future";
		}
	},
	{
		name: "user_payment_proof",
		label: "Payment Proof",
		type: "file",
		required: false,
		validate: (value, formValues) => {
			if (["cheque", "bank_transfer"].includes(formValues?.user_payment_mode)) {
				if (!value || value.length === 0) {
					return "Payment proof is required for cheque/bank transfer";
				}
				const file = value[0];
				if (file.size > 5 * 1024 * 1024) {
					return "File size must be less than 5MB";
				}
				if (
					!["image/jpeg", "image/png", "application/pdf"].includes(file.type)
				) {
					return "Only JPG, PNG, and PDF files are allowed";
				}
			}
			return true;
		},
		multiple: false,
		bucketName: "payment-proof-images",
	},
	...(partnerBalance > 0
		? [
				{
					name: "partner_payment_mode",
					label: "Partner Payment Mode",
					type: "select",
					required: { value: true, message: "Payment mode is required" },
					options: [
						{ value: "cash", label: "Cash" },
						{ value: "cheque", label: "Cheque" },
						{ value: "bank_transfer", label: "Bank Transfer" },
					],
				},
				{
					step: 0.01,
					inputMode: "decimal",
					pattern: "^\\d+(\\.\\d{1,2})?$",
					name: "partner_payment_amount",
					label: "Partner Amount",
					type: "number",
					required: { value: true, message: "Amount is required" },
					defaultValue: partnerBalance,
					min: { value: 1, message: "Amount must be greater than 0" },
					max: {
						value: partnerBalance,
						message: "Cannot exceed partner balance",
					},
				},
				{
				name: "partner_payment_date",
				label: "Partner Payment Date & Time",
				type: "datetime",
				defaultValue: new Date(),
				required: { value: true, message: "Partner Payment date is required" },
				validate: (value) => {
					if (!value) return true;
					const selectedDate = new Date(value);
					const now = new Date();
					return selectedDate <= now || "Payment date cannot be in the future";
				}
				},
				{
					name: "partner_payment_proof",
					label: "Partner Payment Proof",
					type: "file",
					required: false,
					validate: (value, formValues) => {
						if (
							["cheque", "bank_transfer"].includes(
								formValues?.partner_payment_mode
							)
						) {
							if (!value || value.length === 0) {
								return "Payment proof is required for cheque/bank transfer";
							}
							const file = value[0];
							if (file.size > 5 * 1024 * 1024) {
								return "File size must be less than 5MB";
							}
							if (
								!["image/jpeg", "image/png", "application/pdf"].includes(
									file.type
								)
							) {
								return "Only JPG, PNG, and PDF files are allowed";
							}
						}
						return true;
					},
					multiple: false,
					bucketName: "payment-proof-images",
				},
		  ]
		: []),
];
