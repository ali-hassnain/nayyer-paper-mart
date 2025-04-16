import Compressor from "compressorjs";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { POST__uploadFile } from "@/services/actions";
import { createClient } from "@/supabase/client";
import { paperTypeConstant } from "@/lib/constants";

export const formatDate = (dateString) => {
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	const options = { year: "numeric", month: "long", day: "numeric" };
	return date.toLocaleDateString("en-US", options);
};

export const getTotalNumberOfPaginatedPages = (
	totalNumberOfPosts,
	paginatedItemsPerPage
) => Math.ceil(totalNumberOfPosts / paginatedItemsPerPage);

export const isLastPaginatedPage = (totalNumberOfPaginatedPages, activePage) =>
	totalNumberOfPaginatedPages === activePage;

export const getPaginationContext = async (
	query,
	paginatedItemsPerPage,
	activePage
) => {
	const totalNumberOfPosts = await query;
	const totalNumberOfPaginatedPages = getTotalNumberOfPaginatedPages(
		totalNumberOfPosts,
		paginatedItemsPerPage
	);
	const lastPaginatedPage = isLastPaginatedPage(
		totalNumberOfPaginatedPages,
		activePage
	);
	return {
		totalNumberOfPosts,
		totalNumberOfPaginatedPages,
		lastPaginatedPage,
	};
};

export const checkValidJSONString = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};

export const checkValidJS = (str) => {
	try {
		new Function(`${str}`)();
	} catch (e) {
		return false;
	}
	return true;
};

export function formatBytes(bytes, opts = {}) {
	const { decimals = 0, sizeType = "normal" } = opts;

	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
	if (bytes === 0) return "0 Byte";
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
		sizeType === "accurate" ? accurateSizes[i] ?? "Bytes" : sizes[i] ?? "Bytes"
	}`;
}

export const currentLocation = (setGeoLocation) => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, error);
	} else {
		console.log("Geolocation not supported");
	}
	function success(position) {
		const lat = position.coords.latitude;
		const lng = position.coords.longitude;
		setGeoLocation({ lat, lng });
	}
	function error() {
		console.log("Unable to retrieve your location");
	}
};

export function getGoogleMapsDirectionsUrl(destinationLat, destinationLng) {
	return `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${destinationLat},${destinationLng}&travelmode=driving`;
}

export const getRandomNumber = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const generateFilePath = (file, userId, isPublicBucket = false) => {
	const originalName = file.name;
	const extension = originalName.slice(originalName.lastIndexOf("."));
	const baseName = originalName.slice(0, originalName.lastIndexOf("."));
	const sanitizedBaseName = slugify(baseName, {
		lower: true,
		remove: /[()]/g,
	});
	return isPublicBucket
		? `public/${sanitizedBaseName}-${uuidv4()}${extension}`
		: `private/${userId}/${sanitizedBaseName}-${uuidv4()}${extension}`;
};

export const imageUploadProcess = ({
	files,
	userId,
	onProgressUpdate = () => {},
	onFileUploaded = () => {},
	onCompletion = () => {},
	onError = () => {},
	bucketName,
	isPublicBucket = false,
}) => {
	const supabase = createClient();
	const compressImage = (file) =>
		new Promise((resolve) => {
			try {
				new Compressor(file, {
					quality: 0.6,
					maxWidth: 2000,
					maxHeight: 2000,
					success: resolve,
					error: (err) => {
						console.warn("Compression failed, using original file:", err);
						resolve(file);
					},
				});
			} catch (error) {
				console.error("Compressor error:", error);
				resolve(file);
			}
		});

	return async () => {
		try {
			for (const file of files) {
				// Process files sequentially
				try {
					onProgressUpdate(file, 10);
					const fileToUpload = await compressImage(file);
					onProgressUpdate(file, 30);

					const filePath = generateFilePath(
						fileToUpload,
						userId,
						isPublicBucket
					);
					const { data, error } = await POST__uploadFile(
						fileToUpload,
						bucketName,
						filePath
					);

					const { data: urlData } = supabase.storage
						.from(bucketName)
						.getPublicUrl(filePath);

					if (error) throw error;

					onFileUploaded({
						name: file.name,
						src: urlData.publicUrl,
					});

					onProgressUpdate(file, 100);
				} catch (error) {
					onError(file, error.message);
					throw error;
				}
			}
			onCompletion();
		} catch (error) {
			throw new Error("Upload failed: " + error.message);
		}
	};
};

export const getSignedUrlFromSupabaseUrl = async (fileUrl) => {
	const supabase = createClient();
	try {
		const urlParts = new URL(fileUrl);
		const pathSegments = urlParts.pathname.split("/");

		if (pathSegments.length < 5) {
			throw new Error("Invalid Supabase Storage URL format.");
		}
		const bucketName = pathSegments[3];
		const filePath = pathSegments.slice(4).join("/");
		const { data, error } = await supabase.storage
			.from(bucketName)
			.createSignedUrl(filePath, 60 * 60);
		if (error) throw error;
		return data.signedUrl;
	} catch (err) {
		console.error("❌ Error generating signed URL:", err.message);
		return null;
	}
};

export const formatCurrency = (amount) => {
	return new Intl.NumberFormat("en-PK", {
		style: "currency",
		currency: "PKR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const getEmailPrefix = (email) => {
	if (typeof email !== "string") return "";
	const trimmedEmail = email.trim();
	const atIndex = trimmedEmail.indexOf("@");
	return atIndex === -1 ? trimmedEmail : trimmedEmail.slice(0, atIndex);
};

export const capitalizeWords = (str) => {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const calculateBalances = ({
	length,
	width,
	weight_per_sheet,
	rate,
	quantity,
	paper_type,
	partnerShare,
}) => {
	const l = parseFloat(length);
	const w = parseFloat(width);
	const weight = parseFloat(weight_per_sheet);
	const r = parseFloat(rate);
	const qty = parseFloat(quantity);

	if (!l || !w || !weight || !r || !qty) {
		return {
			totalBalance: 0.0,
			partnerBalance: 0.0,
			userBalance: 0.0,
		};
	}

	const baseCalculation =
		paper_type === "paper"
			? (l * w * weight) / paperTypeConstant.PAPER
			: (l * w * weight) / paperTypeConstant.CARD;

	const totalBalance = parseFloat((baseCalculation * r * qty).toFixed(2));
	let partnerBalance = 0.0;
	let userBalance = totalBalance;

	if (partnerShare) {
		const sharePercentage = parseFloat(partnerShare);
		partnerBalance = parseFloat(
			((totalBalance * sharePercentage) / 100).toFixed(2)
		);
		userBalance = parseFloat((totalBalance - partnerBalance).toFixed(2));
	}

	return {
		totalBalance,
		partnerBalance,
		userBalance,
	};
};

export const toLocalISOString = (date) => {
	const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
	return new Date(date.getTime() - tzOffset).toISOString();
};

export const removeUnderscores = (sentence = "") => {
	return sentence.replace(/_/g, "");
};
