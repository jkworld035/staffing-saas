import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkClientPaidButton } from "@/components/invoices/MarkClientPaidButton";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/invoice";
import { createClient } from "@/lib/supabase/server";
import { FileDown, Plus } from "lucide-react";
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

const pdfLinkClass = "flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline";

const columns: Column<ClientInvoice>[] = [
  { header: "Invoice #", accessor: (i) => <span className="font-mono text-xs">{i.invoice_number}</span> },
  { header: "Date", accessor: (i) => formatDate(i.invoice_date) },
  { header: "Due", accessor: (i) => formatDate(i.due_date) },
  { header: "Total", accessor: (i) => <span className="font-semibold">{formatCurrency(i.grand_total)}</span>, align: "right" },
  {
    header: "Status",
    accessor: (i) =>
      i.status === "PAID" && i.paid_date ? (
        <div>
          <StatusBadge status={i.status} />
          <p className="mt-0.5 text-xs text-slate-400">Received {formatDate(i.paid_date)}</p>
        </div>
      ) : (
        <StatusBadge status={i.status} />
      ),
  },
  {
    header: "",
    accessor: (i) =>
      ["DRAFT", "SENT", "OVERDUE"].includes(i.status) ? <MarkClientPaidButton id={i.id} /> : null,
    align: "right",
  },
  {
    header: "",
    accessor: (i) => {
      const href = "/api/invoices/client/" + i.id + "/pdf";
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={pdfLinkClass}>
          <FileDown size={12} /> PDF
        </a>
      );
    },
    align: "right",
  },
];

export default async function ClientInvoicesPage() {
  const invoices = await getInvoices();

  const received = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + Number(i.grand_total), 0);
  const receivedThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.paid_date && new Date(i.paid_date).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + Number(i.grand_total), 0);
  const pending = invoices
    .filter((i) => ["DRAFT", "SENT", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + Number(i.grand_total), 0);

  return (
    <>
      <Topbar
        title="Client Invoices"
        action={
          <Button href="/invoices/client/new">
            <Plus size={15} /> New invoice
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md border border-line bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Received (all time)</p>
            <p className="tabular mt-1 text-lg font-semibold text-signal-600">{formatCurrency(received)}</p>
          </div>
          <div className="rounded-md border border-line bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Received this month</p>
            <p className="tabular mt-1 text-lg font-semibold text-signal-600">{formatCurrency(receivedThisMonth)}</p>
          </div>
          <div className="rounded-md border border-line bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pending</p>
            <p className="tabular mt-1 text-lg font-semibold text-ink">{formatCurrency(pending)}</p>
          </div>
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
        <p className="text-xs text-slate-400">
          Auto-generated from approved timesheets. Click "Mark received" once payment actually arrives from the client.
        </p>
      </div>
    </>
  );
}
