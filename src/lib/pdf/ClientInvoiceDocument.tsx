import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function money(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency === "INR" ? "Rs " : currency === "GBP" ? "GBP " : currency + " ";
  return symbol + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0B1120" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  brandBlock: {},
  brandName: { fontSize: 18, fontWeight: 700, color: "#4F46E5" },
  brandSub: { fontSize: 9, color: "#475467", marginTop: 2 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: "#475467", textAlign: "right", marginTop: 4 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  metaBlock: { width: "48%" },
  metaLabel: { fontSize: 8, color: "#98A2B3", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 },
  metaValue: { fontSize: 10, color: "#0B1120", marginBottom: 2 },
  table: { marginTop: 10, borderTop: "1 solid #E4E7EC" },
  tableHeaderRow: { flexDirection: "row", paddingVertical: 8, borderBottom: "1 solid #E4E7EC" },
  tableRow: { flexDirection: "row", paddingVertical: 8, borderBottom: "1 solid #E4E7EC" },
  th: { fontSize: 8, color: "#98A2B3", textTransform: "uppercase", letterSpacing: 0.5 },
  td: { fontSize: 10, color: "#0B1120" },
  colDesc: { width: "40%" },
  colHours: { width: "15%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "25%", textAlign: "right" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 10, color: "#475467" },
  totalsValue: { fontSize: 10, color: "#0B1120" },
  grandTotalRow: { flexDirection: "row", width: 220, justifyContent: "space-between", paddingVertical: 8, marginTop: 4, borderTop: "1 solid #0B1120" },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, color: "#0B1120" },
  grandTotalValue: { fontSize: 11, fontWeight: 700, color: "#0B1120" },
  statusBadge: { fontSize: 9, color: "#059669", marginTop: 20 },
  footer: { position: "absolute", bottom: 40, left: 40, right: 40, fontSize: 8, color: "#98A2B3", textAlign: "center", borderTop: "1 solid #E4E7EC", paddingTop: 10 },
});

export interface InvoicePdfData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  poNumber: string | null;
  clientName: string;
  clientCompany: string;
  billingContact: string | null;
  billingEmail: string | null;
  consultantName: string;
  hoursWorked: number;
  billRate: number;
  regularAmount: number;
  otAmount: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  currency: string;
}

export function ClientInvoiceDocument({ data }: { data: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>StaffLedger</Text>
            <Text style={styles.brandSub}>IT Staffing Operations</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{data.clientName}</Text>
            <Text style={styles.metaValue}>{data.clientCompany}</Text>
            {data.billingContact && <Text style={styles.metaValue}>{data.billingContact}</Text>}
            {data.billingEmail && <Text style={styles.metaValue}>{data.billingEmail}</Text>}
          </View>
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text style={styles.metaValue}>{formatDate(data.invoiceDate)}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
            {data.poNumber && (
              <>
                <Text style={[styles.metaLabel, { marginTop: 8 }]}>PO Number</Text>
                <Text style={styles.metaValue}>{data.poNumber}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colHours]}>Hours</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colDesc]}>{data.consultantName} -- Regular hours</Text>
            <Text style={[styles.td, styles.colHours]}>{data.hoursWorked.toFixed(2)}</Text>
            <Text style={[styles.td, styles.colRate]}>{money(data.billRate, data.currency)}</Text>
            <Text style={[styles.td, styles.colAmount]}>{money(data.regularAmount, data.currency)}</Text>
          </View>
          {data.otAmount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, styles.colDesc]}>{data.consultantName} -- Overtime</Text>
              <Text style={[styles.td, styles.colHours]}>--</Text>
              <Text style={[styles.td, styles.colRate]}>--</Text>
              <Text style={[styles.td, styles.colAmount]}>{money(data.otAmount, data.currency)}</Text>
            </View>
          )}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{money(data.regularAmount + data.otAmount, data.currency)}</Text>
          </View>
          {data.taxes > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taxes</Text>
              <Text style={styles.totalsValue}>{money(data.taxes, data.currency)}</Text>
            </View>
          )}
          {data.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.totalsValue}>-{money(data.discount, data.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>{money(data.grandTotal, data.currency)}</Text>
          </View>
        </View>

        <Text style={styles.statusBadge}>Status: {data.status}</Text>

        <Text style={styles.footer}>
          Generated by StaffLedger -- questions about this invoice? Contact your account manager.
        </Text>
      </Page>
    </Document>
  );
}
