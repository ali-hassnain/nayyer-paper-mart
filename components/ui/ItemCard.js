import React from "react";
import Image from "next/image";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/shadcn/card";
import { ArrowRight } from "lucide-react";
import Spinner from "./Spinner";

/**
 * GenericCard Component
 *
 * @param {Object} props
 * @param {Object} props.post - The post data with keys: id, url, image, title, summary.
 * @param {string} [props.className] - Optional additional CSS classes.
 */
const ItemCard = ({
	post,
	className = "",
	footerContent,
	content,
	headerContent,
	imageSrc,
	footerClassName,
	loading,
}) => {
	return (
		<Card
			key={post.id}
			className={`grid grid-rows-[auto_auto_1fr_auto] rounded-lg ${className}`}
		>
			<div className=' bg-[#f2f2f2] rounded-lg relative aspect-[16/9] w-auto block transition-opacity duration-200 fade-in hover:opacity-95 cursor-pointer'>
				{!loading && (
					<Image
						src={
							imageSrc ?? "https://placehold.co/400?text=Loading...&font=roboto"
						}
						alt={post.title || "Image"}
						fill
						className='object-cover rounded-lg'
						unoptimized={true}
					/>
				)}
			</div>
			<CardHeader>{headerContent}</CardHeader>
			<CardContent>{content}</CardContent>
			<CardFooter className={footerClassName}>{footerContent}</CardFooter>
		</Card>
	);
};

export default ItemCard;
