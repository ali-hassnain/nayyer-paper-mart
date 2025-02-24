export const organization = "Swoop Parts";
export const supabaseStorageBucketURL = (bucketName) => {
	return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/s3/${bucketName}`;
};
export const rootURL =
	process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: process.env.NEXT_PUBLIC_BASE_URL;
export const loginPageUrl = `${rootURL}/auth/login`;
export const roles = {
	SALES: "sales",
	PURCHASER: "purchaser",
	ADMIN: "admin",
};
export const salesStatus = {
	QUOTATION: "quotation",
	SHIPMENT: "shipment",
	DELIVERY: "delivered",
};
export const purchaserStatus = {
	OPEN: "open",
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
};
