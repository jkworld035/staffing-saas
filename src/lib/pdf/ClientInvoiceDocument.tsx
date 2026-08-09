import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";

function money(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency === "INR" ? "Rs " : currency === "GBP" ? "GBP " : currency + " ";
  return symbol + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: "#0B1120" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, color: "#1D4ED8", marginBottom: 8 },
  companyName: { fontSize: 10, fontWeight: 700, marginBottom: 2 },
  companyLine: { fontSize: 9, color: "#475467", marginBottom: 1 },
  contactBlock: { marginTop: 8 },
  logoWordmark: { fontSize: 16, fontWeight: 700, color: "#1D4ED8", letterSpacing: 1 },

  billBox: { backgroundColor: "#EFF6FF", borderRadius: 4, padding: 20, marginBottom: 24 },
  billRow: { flexDirection: "row", justifyContent: "space-between" },
  billCol: { width: "48%" },
  boxLabel: { fontSize: 9, fontWeight: 700, marginBottom: 6 },
  boxLine: { fontSize: 9, color: "#0B1120", marginBottom: 1 },
  detailRow: { flexDirection: "row", marginBottom: 2 },
  detailLabel: { fontSize: 9, color: "#475467" },
  detailValue: { fontSize: 9, color: "#0B1120", marginLeft: 4 },

  table: { marginBottom: 4 },
  tableHeaderRow: { flexDirection: "row", paddingBottom: 6, borderBottom: "1 solid #0B1120" },
  tableRow: { flexDirection: "row", paddingVertical: 8, borderBottom: "1 solid #E4E7EC" },
  th: { fontSize: 8, color: "#475467" },
  td: { fontSize: 9, color: "#0B1120" },
  colNum: { width: "4%" },
  colDate: { width: "12%" },
  colProduct: { width: "20%" },
  colDesc: { width: "34%" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "10%", textAlign: "right" },
  colAmount: { width: "10%", textAlign: "right" },

  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  payBlock: { width: "55%" },
  payTitle: { fontSize: 11, fontWeight: 700, color: "#1D4ED8", marginBottom: 8 },
  payLine: { fontSize: 9, color: "#0B1120", marginBottom: 2 },
  payButton: { backgroundColor: "#1D4ED8", borderRadius: 4, paddingVertical: 8, paddingHorizontal: 16, marginTop: 10, width: 130 },
  payButtonText: { color: "#FFFFFF", fontSize: 9, fontWeight: 700, textAlign: "center" },
  payFallback: { fontSize: 8, color: "#98A2B3", marginTop: 8, maxWidth: 220 },

  totalsBlock: { width: "35%", alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 160, paddingVertical: 3, borderBottom: "1 solid #E4E7EC" },
  totalsLabel: { fontSize: 9, color: "#475467" },
  totalsValue: { fontSize: 9, color: "#0B1120" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 160, paddingTop: 8, marginTop: 4 },
  grandTotalLabel: { fontSize: 11, fontWeight: 700 },
  grandTotalValue: { fontSize: 11, fontWeight: 700 },

  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 7, color: "#98A2B3", textAlign: "center" },
});

export const COMPANY_INFO = {
  name: "Stackave Solutions",
  addressLines: ["3700 Standridge Dr Ste 104", "The Colony, TX 75056"],
  email: "accounts@stackave.com",
  phone: "+1 (832) 585-4280",
  wordmark: "STACKAVE",
};

export interface InvoicePdfData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  status: string;
  poNumber: string | null;
  clientName: string;
  clientCompany: string;
  billingContact: string | null;
  billingEmail: string | null;
  consultantName: string;
  periodLabel: string;
  hoursWorked: number;
  billRate: number;
  regularAmount: number;
  otAmount: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  currency: string;
  bankRouting?: string;
  bankAccount?: string;
  paymentLink?: string;
}

export function ClientInvoiceDocument({ data }: { data: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            {COMPANY_INFO.addressLines.map((line) => (
              <Text key={line} style={styles.companyLine}>{line}</Text>
            ))}
            <View style={styles.contactBlock}>
              <Text style={styles.companyLine}>{COMPANY_INFO.email}</Text>
              <Text style={styles.companyLine}>{COMPANY_INFO.phone}</Text>
            </View>
          </View>
          <Text style={styles.logoWordmark}>{COMPANY_INFO.wordmark}</Text>
        </View>

        <View style={styles.billBox}>
          <View style={styles.billRow}>
            <View style={styles.billCol}>
              <Text style={styles.boxLabel}>Bill to</Text>
              <Text style={styles.boxLine}>{data.clientCompany || data.clientName}</Text>
              {data.billingContact && <Text style={styles.boxLine}>{data.billingContact}</Text>}
              {data.billingEmail && <Text style={styles.boxLine}>{data.billingEmail}</Text>}
            </View>
            <View style={styles.billCol}>
              <Text style={styles.boxLabel}>Invoice details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice no.:</Text>
                <Text style={styles.detailValue}>{data.invoiceNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Terms:</Text>
                <Text style={styles.detailValue}>{data.paymentTerms}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice date:</Text>
                <Text style={styles.detailValue}>{formatDate(data.invoiceDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due date:</Text>
                <Text style={styles.detailValue}>{formatDate(data.dueDate)}</Text>
              </View>
              {data.poNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PO number:</Text>
                  <Text style={styles.detailValue}>{data.poNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colNum]}>#</Text>
            <Text style={[styles.th, styles.colDate]}>Date</Text>
            <Text style={[styles.th, styles.colProduct]}>Product or service</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colNum]}>1.</Text>
            <Text style={[styles.td, styles.colDate]}>{formatDate(data.invoiceDate)}</Text>
            <Text style={[styles.td, styles.colProduct, { fontWeight: 700 }]}>{data.consultantName}</Text>
            <Text style={[styles.td, styles.colDesc]}>{data.periodLabel}</Text>
            <Text style={[styles.td, styles.colQty]}>{data.hoursWorked.toFixed(0)}</Text>
            <Text style={[styles.td, styles.colRate]}>{money(data.billRate, data.currency)}</Text>
            <Text style={[styles.td, styles.colAmount]}>{money(data.regularAmount, data.currency)}</Text>
          </View>
          {data.otAmount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, styles.colNum]}>2.</Text>
              <Text style={[styles.td, styles.colDate]}>{formatDate(data.invoiceDate)}</Text>
              <Text style={[styles.td, styles.colProduct, { fontWeight: 700 }]}>{data.consultantName}</Text>
              <Text style={[styles.td, styles.colDesc]}>Overtime hours</Text>
              <Text style={[styles.td, styles.colQty]}>--</Text>
              <Text style={[styles.td, styles.colRate]}>--</Text>
              <Text style={[styles.td, styles.colAmount]}>{money(data.otAmount, data.currency)}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.payBlock}>
            <Text style={styles.payTitle}>Ways to pay</Text>
            {data.bankRouting && data.bankAccount ? (
              <>
                <Text style={styles.payLine}>Routing # {data.bankRouting}</Text>
                <Text style={styles.payLine}>Account # {data.bankAccount}</Text>
              </>
            ) : (
              <Text style={styles.payFallback}>
                Contact {COMPANY_INFO.email} for bank transfer details.
              </Text>
            )}
            {data.paymentLink && (
              <Link src={data.paymentLink} style={styles.payButton}>
                <Text style={styles.payButtonText}>View and pay</Text>
              </Link>
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
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{money(data.grandTotal, data.currency)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          {COMPANY_INFO.name} -- Invoice {data.invoiceNumber} -- Status: {data.status}
        </Text>
      </Page>
    </Document>
  );
}
