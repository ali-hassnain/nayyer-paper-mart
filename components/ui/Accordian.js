import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/shadcn/accordion";

const AccordionWrapper = ({
	items,
	type = "single",
	collapsible = true,
	className = "",
}) => {
	return (
		<Accordion type={type} collapsible={collapsible} className={className}>
			{items.map((item, index) => (
				<AccordionItem
					key={item.value || index}
					value={item.value || `item-${index}`}
				>
					<AccordionTrigger>{item.trigger}</AccordionTrigger>
					<AccordionContent>{item.content}</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};
export default AccordionWrapper;
