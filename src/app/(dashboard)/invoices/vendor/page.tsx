import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { MarkVendorPaidButton } from "@/components/invoices/MarkPaidButton";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/invoice";
import { createClient } from "@/lib/supabase/server";
import type { VendorInvoice } from "@/types/database.types";

async function getVendorInvoices(): Promise<VendorInvoice[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vendor_invoices")
      .select("*")
      .order("invoice_date", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: Column<VendorInvoice>[] = [
  { header: "Invoice #", accessor: (i) => <span className="font-mono text-xs">{i.invoice_number}</span> },
  { header: "Date", accessor: (i) => formatDate(i.invoice_date) },
  { header: "Due", accessor: (i) => formatDate(i.due_date) },
  { header: "Hours", accessor: (i) => i.hours, align: "right" },
  { header: "Vendor rate", accessor: (i) => formatCurrency(i.vendor_rate), align: "right" },
  { header: "Amount", accessor: (i) => <span className="font-semibold">{formatCurrency(i.amount)}</span>, align: "right" },
  { header: "Status", accessor: (i) =>
      i.status === "PAID" && i.paid_date
        ? (
          <div>
            <StatusBadge status={i.status} />
            <p className="mt-0.5 text-xs text-slate-400">Paid {formatDate(i.paid_date)}</p>
          </div>
        )
        : <StatusBadge status={i.status} /> },
  { header: "", accessor: (i) =>
      ["PENDING", "APPROVED"].includes(i.status) ? <MarkVendorPaidButton id={i.id} /> : null,
    align: "right" },
];

export default async function VendorInvoicesPage() {
  const invoices = await getVendorInvoices();
  const pending = invoices
    .filter((i) => ["PENDING", "APPROVED"].includes(i.status))
    .reduce((s, i) => s + Number(i.amount), 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.paid_date && new Date(i.paid_date).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <Topbar title="Vendor Invoices" />
      <div className="space-y-4 p-6">
        <div className="flex gap-4">
          <div className="flex-1 rounded-md border border-line bg-surface px-5 py-3 text-sm text-slate-600">
            <span className="tabular font-semibold text-ink">{formatCurrency(pending)}</span> pending payment.
          </div>
          <div className="flex-1 rounded-md border border-line bg-surface px-5 py-3 text-sm text-slate-600">
            <span className="tabular font-semibold text-signal-600">{formatCurrency(paidThisMonth)}</span> cleared this month.
          </div>
        </div>
        <Card>
          <DataTable
            columns={columns}
            rows={invoices}
            keyFor={(i) => i.id}
            emptyTitle="No vendor invoices yet"
            emptyHint="These appear when a C2C consultant's timesheet is approved."
          />
        </Card>
        <p className="text-xs text-slate-400">
          Generated automatically for C2C consultants when their timesheet is approved. Click "Mark paid" once you have actually sent the vendor their payment.
        </p>
      </div>
    </>
  );
}
