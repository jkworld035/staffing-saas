import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
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
  { header: "Status", accessor: (i) => <StatusBadge status={i.status} /> },
];

export default async function VendorInvoicesPage() {
  const invoices = await getVendorInvoices();
  const pending = invoices
    .filter((i) => ["PENDING", "APPROVED"].includes(i.status))
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <Topbar title="Vendor Invoices" />
      <div className="space-y-4 p-6">
        <div className="rounded-md border border-line bg-surface px-5 py-3 text-sm text-slate-600">
          Generated automatically for C2C consultants when their timesheet is approved.{" "}
          <span className="tabular font-semibold text-ink">{formatCurrency(pending)}</span> pending payment.
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
      </div>
    </>
  );
}
