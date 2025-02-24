import { notFound } from "next/navigation";
import {
	GET__getPhotoById,
	GET__getUser,
	GET__getUserLikeStatusForPhoto,
} from "@/services/queries-ssr";
import PhotoViewport from "@/components/templates/photo/PhotoViewport";

export default async function PhotoPage({ params }) {
	params = await params;
	let { slug } = params;
	const photoId = slug.split("-").pop();
	const data = await GET__getPhotoById(photoId);
	const { data: userData, error } = await GET__getUser();
	const userId = userData?.user?.id;
	let userLikeStatus = null;
	if (userId) {
		userLikeStatus = await GET__getUserLikeStatusForPhoto(userId, photoId);
	}
	let photo;
	if (!data.photo) {
		return notFound();
	}
	photo = data.photo;
	console.log(userLikeStatus);
	const pageData = {
		photo,
		userId,
		userLikeStatus,
	};

	return (
		<>
			<PhotoViewport data={pageData} />
		</>
	);
}
