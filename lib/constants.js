export const organization = "Nayyer Paper Mart";
export const supabaseStorageBucketURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`;

export const rootURL =
	process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: process.env.NEXT_PUBLIC_BASE_URL;
export const loginPageUrl = `${rootURL}/auth/login`;

export const orderType = {
	PURCHASE: "purchase",
	SALE: "sale",
};

export const orderStatus = {
	PENDING: "pending",
	COMPLETE: "complete",
};

export const customerType = {
	SUPPLIER: "supplier",
	BUYER: "buyer",
};

export const paperTypeConstant = { PAPER: 3100, CARD: 15500 };
