import React from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/shadcn/table";

const TableWrapper = ({ caption, columns, data, footer }) => {
	return (
		<Table>
			{caption && <TableCaption>{caption}</TableCaption>}
			<TableHeader>
				<TableRow>
					{columns.map((col, index) => (
						<TableHead key={index} className={col.className}>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row, rowIndex) => (
					<TableRow key={rowIndex}>
						{columns.map((col, colIndex) => (
							<TableCell key={colIndex} className={col.className}>
								{col.render
									? col.render(row[col.accessor], row)
									: row[col.accessor]}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
			{footer && (
				<TableFooter>
					<TableRow>
						<TableCell colSpan={columns.length}>{footer}</TableCell>
					</TableRow>
				</TableFooter>
			)}
		</Table>
	);
};

export default TableWrapper;
