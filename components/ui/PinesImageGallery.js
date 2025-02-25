import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageGallery({ images = [], loading = false }) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);

	// Open the modal with the clicked image
	const openGallery = (index) => {
		setActiveIndex(index);
		setIsOpen(true);
		setIsZoomed(false);
	};

	const closeGallery = () => {
		setIsOpen(false);
		setIsZoomed(false);
	};

	// Navigate to the next image and reset zoom
	const nextImage = () => {
		setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
		setIsZoomed(false);
	};

	// Navigate to the previous image and reset zoom
	const prevImage = () => {
		setActiveIndex((prevIndex) =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1
		);
		setIsZoomed(false);
	};

	// Handle keyboard navigation when modal is open
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!isOpen) return;
			if (e.key === "ArrowRight") nextImage();
			if (e.key === "ArrowLeft") prevImage();
			if (e.key === "Escape") closeGallery();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, images]);

	// Toggle zoom state when the modal image is clicked
	const toggleZoom = (e) => {
		e.stopPropagation();
		setIsZoomed((prev) => !prev);
	};

	return (
		<div className='w-full h-full select-none'>
			{/* Image Grid */}
			<ul className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
				{loading ? (
					<p>Loading images...</p>
				) : (
					images.map((src, index) => (
						<li
							key={index}
							className='cursor-pointer'
							onClick={() => openGallery(index)}
						>
							<Image
								unoptimized
								src={src}
								alt={`Image ${index + 1}`}
								width={300}
								height={300}
								className='object-cover rounded-lg'
							/>
						</li>
					))
				)}
			</ul>

			{/* Modal for Large, Zoomable Image */}
			{isOpen && (
				<div
					className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50'
					onClick={closeGallery}
				>
					<div className='relative w-11/12 xl:w-4/5 h-4/5 flex items-center justify-center'>
						{/* Previous Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								prevImage();
							}}
							className='absolute left-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/40'
						>
							<svg
								className='w-6 h-6'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth='1.5'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M15.75 19.5L8.25 12l7.5-7.5'
								/>
							</svg>
						</button>

						{/* Large Zoomable Image */}
						<div onClick={toggleZoom} className='cursor-zoom-in'>
							<Image
								unoptimized
								src={images[activeIndex]}
								alt={`Image ${activeIndex + 1}`}
								width={800}
								height={600}
								className={`object-contain max-w-full max-h-full transition-transform duration-300 ${
									isZoomed ? "scale-150 cursor-zoom-out" : "scale-100"
								}`}
							/>
						</div>

						{/* Next Button */}
						<button
							onClick={(e) => {
								e.stopPropagation();
								nextImage();
							}}
							className='absolute right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/40'
						>
							<svg
								className='w-6 h-6'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth='1.5'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M8.25 4.5l7.5 7.5-7.5 7.5'
								/>
							</svg>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
