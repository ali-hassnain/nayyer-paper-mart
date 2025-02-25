import Compressor from "compressorjs";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { POST__uploadFile } from "@/services/actions";
import { createClient } from "../supabase/client";

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

// const generateFilePath = (file, userId) => {
// 	const originalName = file.name;
// 	const dotIndex = originalName.lastIndexOf(".");
// 	const baseName =
// 		dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
// 	const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : "";
// 	const sanitizedBaseName = slugify(baseName, { lower: true });
// 	return `${userId}/${sanitizedBaseName}-${uuidv4()}${extension}`;
// };

const generateFilePath = (file, userId) => {
	const originalName = file.name;
	const dotIndex = originalName.lastIndexOf(".");
	const baseName =
		dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
	const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : "";
	const sanitizedBaseName = slugify(baseName, { lower: true });
	return `${userId}/${sanitizedBaseName}-${uuidv4()}${extension}`;
};

export const imageUploadProcess = ({
	files,
	userId,
	storageBucketURL,
	onProgressUpdate = () => {},
	onFileUploaded = () => {},
	onCompletion = () => {},
	onError = () => {},
	bucketName,
}) => {
	const compressImage = (file) =>
		new Promise((resolve, reject) => {
			new Compressor(file, {
				quality: 0.6,
				maxWidth: 2000,
				maxHeight: 2000,
				success: resolve,
				error: reject,
			});
		});

	return async () => {
		const uploadedFileNames = new Set();
		try {
			const uploadPromises = files.map(async (file) => {
				if (uploadedFileNames.has(file.name)) {
					return;
				}
				uploadedFileNames.add(file.name);
				try {
					onProgressUpdate(file, getRandomNumber(5, 20));

					let fileToUpload = file;
					try {
						fileToUpload = await compressImage(file);
					} catch (compressionError) {
						console.warn(
							`Compression failed for ${file.name}`,
							compressionError
						);
					}
					const filePath = generateFilePath(file, userId);
					const { data, error } = await POST__uploadFile(
						fileToUpload,
						bucketName,
						filePath
					);
					if (error) throw error;

					onFileUploaded({
						name: file.name,
						src: `${storageBucketURL}/${data.fullPath}`,
					});
					onProgressUpdate(file, 100);
				} catch (error) {
					onError(file, error.message);
					throw error;
				}
			});
			await Promise.all(uploadPromises);
			onCompletion();
		} catch (error) {
			throw new Error("One or more uploads failed");
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
