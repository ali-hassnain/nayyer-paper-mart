"use client";
import React, { useState } from "react";
import GalleryGrid from "@/components/ui/GalleryGrid";
import { GET__getPhotos } from "@/services/queries-csr";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "@/components/ui/Spinner";

const GalleryGridWrapper = ({
	initialMedia,
	initialMediaRange,
	totalCount,
	initialFilters,
}) => {
	const rangeDifference = initialMediaRange.end - initialMediaRange.start + 1;

	const [media, setMedia] = useState(initialMedia);
	const [mediaRange, setMediaRange] = useState({
		start: media.length,
		end: initialMediaRange.end + media.length,
	});
	const [hasMore, setHasMore] = useState(media.length < totalCount);

	const handleLoadPhotos = async () => {
		try {
			const { photos, error } = await GET__getPhotos(
				mediaRange.start,
				mediaRange.end,
				initialFilters
			);

			if (error) {
				console.error("Error loading photos:", error);
				return;
			}

			if (photos && photos.length > 0) {
				setMedia((prevState) => [...prevState, ...photos]);
				setMediaRange((prevState) => ({
					start: prevState.start + rangeDifference,
					end: prevState.end + rangeDifference,
				}));
				if (media.length + photos.length >= totalCount) {
					setHasMore(false);
				}
			} else {
				setHasMore(false);
			}
		} catch (err) {
			console.error("Unexpected error:", err);
		}
	};

	return (
		<InfiniteScroll
			dataLength={media.length}
			next={handleLoadPhotos}
			hasMore={hasMore}
			loader={
				<div className=''>
					<Spinner />
				</div>
			}
			scrollThreshold={0.8}
			endMessage={``}
		>
			<GalleryGrid media={media} />
		</InfiniteScroll>
	);
};

export default GalleryGridWrapper;
