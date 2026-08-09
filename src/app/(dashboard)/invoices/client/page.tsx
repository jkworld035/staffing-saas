import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/invoice";
import { createClient } from "@/lib/supabase/server";
import { FileDown } from "lucide-react";
import type { ClientInvoice } from "@/types/database.types";

async function getInvoices(): Promise<ClientInvoice[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("client_invoices")
      .select("*")
      .order("invoice_date", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: Column<ClientInvoice>[] = [
  { header: "Invoice #", accessor: (i) => <span className="font-mono text-xs">{i.invoice_number}</span> },
  { header: "Date", accessor: (i) => formatDate(i.invoice_date) },
  { header: "Due", accessor: (i) => formatDate(i.due_date) },
  { header: "Hours", accessor: (i) => i.hours_worked, align: "right" },
  { header: "Bill rate", accessor: (i) => formatCurrency(i.bill_rate), align: "right" },
  { header: "Taxes", accessor: (i) => formatCurrency(i.taxes), align: "right" },
  { header: "Total", accessor: (i) => <span className="font-semibold">{formatCurrency(i.grand_total)}</span>, align: "right" },
  { header: "Status", accessor: (i) => <StatusBadge status={i.status} /> },
  { header: "", accessor: (i) => (
      
        href={`/api/invoices/client/${i.id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
      >
        <FileDown size={12} /> PDF
      </a>
    ), align: "right" },
];

export default async function ClientInvoicesPage() {
  const invoices = await getInvoices();
  const outstanding = invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + Number(i.grand_total), 0);

  return (
    <>
      <Topbar title="Client Invoices" />
      <div className="space-y-4 p-6">
        <div className="rounded-md border border-line bg-surface px-5 py-3 text-sm text-slate-600">
          Auto-generated from approved timesheets.{" "}
          <span className="tabular font-semibold text-ink">{formatCurrency(outstanding)}</span> currently outstanding.
        </div>
        <Card>
          <DataTable
            columns={columns}
            rows={invoices}
            keyFor={(i) => i.id}
            emptyTitle="No invoices yet"
            emptyHint="Invoices appear automatically once a timesheet is approved."
          />
        </Card>
      </div>
    </>
  );
}
