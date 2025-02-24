import React from "react";
import Image from "next/image";
import {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
} from "@/components/ui/shadcn/card";
import { ArrowRight } from "lucide-react";

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
	image,
}) => {
	return (
		<Card
			key={post.id}
			className={`grid grid-rows-[auto_auto_1fr_auto] ${className}`}
		>
			<div className='relative aspect-[16/9] w-full'>{image}</div>
			<CardHeader>{headerContent}</CardHeader>
			<CardContent>{content}</CardContent>
			<CardFooter>{footerContent}</CardFooter>
		</Card>
	);
};

export default ItemCard;
