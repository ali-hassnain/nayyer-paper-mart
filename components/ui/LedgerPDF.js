import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { removeUnderscores } from "@/lib/helpers";
import {customerType} from "../../lib/constants";

const styles = StyleSheet.create({
	page: { padding: 30 },
	header: { fontSize: 24, marginBottom: 20, textAlign: "center" },
	section: { marginBottom: 10 },
	customerInfoText: { fontSize: 10, marginBottom: 2 },
	table: { display: "table", width: "100%", marginBottom: 15 },
	tableRow: { flexDirection: "row" },
	tableHeader: { backgroundColor: "#f0f0f0" },
	dateCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	descCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	dimensionsCell: {
		width: "150px",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	qtyCell: {
		width: "12%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	rateCell: {
		width: "12%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	modeCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	debitCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	creditCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	balanceCell: {
		width: "15%",
		padding: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000",
		fontSize: 10,
	},
	amountText: { fontWeight: 500, color: "#16a34a" },
	debitAmountText: { fontWeight: 500, color: "#942245" },
});

const LedgerPDF = ({ customer = {}, transactions = [] }) => {

	const sortedTransactions = [...transactions].sort(
		(a, b) => new Date(a?.date || 0) - new Date(b?.date || 0)
	);

	const previousBalance = customer?.previous_balance || 0;
	const currentNetBalance = customer?.customer_balance || 0;
	let runningBalance = previousBalance;

	return (
		<Document>
			<Page size='A4' style={styles.page}>
				<Text style={styles.header}>
					{customer?.business_name || "Customer"} - Account Ledger
				</Text>

				<View style={styles.section}>
					<Text style={styles.customerInfoText}>
						Business Name: {customer?.business_name || ""}
					</Text>
					<Text style={styles.customerInfoText}>
						Contact: {customer?.contact_name || ""}
					</Text>
					<Text style={styles.customerInfoText}>
						Phone: {customer?.business_contact || ""}
					</Text>
					<Text style={styles.customerInfoText}>
						Address: {customer?.address || ""}
					</Text>
					<Text style={styles.customerInfoText}>
						Previous Balance:{" "}
						<Text style={styles.amountText}>
							PKR {previousBalance.toLocaleString()}
						</Text>
					</Text>
					<Text style={styles.customerInfoText}>
						Total Balance:{" "}
						<Text style={styles.amountText}>
							PKR {(previousBalance + currentNetBalance).toLocaleString()}
						</Text>
					</Text>
				</View>

				<View style={styles.table}>
					<View style={[styles.tableRow, styles.tableHeader]}>
						<Text style={styles.dateCell}>Date</Text>
						{/*<Text style={styles.descCell}>Desc.</Text>*/}
						<Text style={styles.dimensionsCell}>Dimensions</Text>
						<Text style={styles.qtyCell}>Qty</Text>
						<Text style={styles.rateCell}>Rate</Text>
						<Text style={styles.modeCell}>Mode</Text>
						<Text style={styles.debitCell}>Bill</Text>
						<Text style={styles.creditCell}>{customer.customer_type === customerType.BUYER ? "Credit" : "Debit"}</Text>
						<Text style={styles.balanceCell}>Balance</Text>
					</View>

					<View style={styles.tableRow}>
						<Text style={styles.dateCell}>
							{customer?.created_at
								? format(new Date(customer.created_at), "dd/MM/yyyy")
								: "N/A"}
						</Text>
						{/*<Text style={styles.descCell}>Previous</Text>*/}
						<Text style={styles.dimensionsCell} />
						<Text style={styles.qtyCell} />
						<Text style={styles.rateCell} />
						<Text style={styles.modeCell} >Previous</Text>
						<Text style={styles.debitCell} />
						<Text style={styles.creditCell} />
						<Text style={styles.balanceCell}>
							{previousBalance.toLocaleString()}
						</Text>
					</View>

					{sortedTransactions.map((transaction) => {

						const amount = transaction?.amount || 0;
						const transactionType = transaction?.type || "payment";
						runningBalance += transactionType === "order" ? amount : -amount;

						return (
							<View
								style={styles.tableRow}
								key={transaction?.id || Math.random()}
							>
								<Text style={styles.dateCell}>
									{transaction?.date
										? format(new Date(transaction.date), "dd/MM/yyyy")
										: ""}
								</Text>

								{/*<Text style={styles.descCell}>*/}
								{/*	{transaction.type === "payment" ? transaction.payment_mode : ""}*/}
								{/*</Text>*/}

								<Text style={styles.dimensionsCell}>
									{transactionType === "order"
										? `${transaction?.length || 0}×${transaction?.width || 0}/${
												transaction?.weight || 0
										  } (${transaction?.product_name || ""})`
										: ""}
								</Text>

								<Text style={styles.qtyCell}>
									{transactionType === "order"
										? (transaction?.quantity || 0).toLocaleString()
										: ""}
								</Text>

								<Text style={styles.rateCell}>
									{transactionType === "order"
										? (transaction?.rate || 0).toLocaleString()
										: ""}
								</Text>

								<Text style={styles.modeCell}>
									{transaction?.payment_mode
										? removeUnderscores(transaction.payment_mode)
										: ""}
								</Text>

								<Text style={[styles.debitCell, styles.debitAmountText]}>
									{transactionType === "order" ? amount.toLocaleString() : ""}
								</Text>

								<Text style={[styles.creditCell, styles.amountText]}>
									{transactionType === "payment" ? amount.toLocaleString() : ""}
								</Text>

								<Text style={styles.balanceCell}>
									{runningBalance.toLocaleString()}
								</Text>
							</View>
						);
					})}
				</View>
			</Page>
		</Document>
	);
};

export default LedgerPDF;
