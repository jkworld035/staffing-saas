import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/invoice";
import { createClient } from "@/lib/supabase/server";
import type { Payroll } from "@/types/database.types";

async function getPayroll(): Promise<Payroll[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("payroll")
      .select("*")
      .order("pay_period_start", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: Column<Payroll>[] = [
  { header: "Pay period", accessor: (p) => `${formatDate(p.pay_period_start)} – ${formatDate(p.pay_period_end)}` },
  { header: "Hours", accessor: (p) => p.hours, align: "right" },
  { header: "Pay rate", accessor: (p) => formatCurrency(p.pay_rate), align: "right" },
  { header: "Gross pay", accessor: (p) => formatCurrency(p.gross_pay), align: "right" },
  { header: "Taxes", accessor: (p) => formatCurrency(p.taxes), align: "right" },
  { header: "Benefits", accessor: (p) => formatCurrency(p.benefits), align: "right" },
  { header: "Net pay", accessor: (p) => <span className="font-semibold">{formatCurrency(p.net_pay)}</span>, align: "right" },
  { header: "Status", accessor: (p) => <StatusBadge status={p.status} /> },
];

export default async function PayrollPage() {
  const payroll = await getPayroll();
  const due = payroll.filter((p) => p.status === "PENDING").reduce((s, p) => s + Number(p.net_pay), 0);

  return (
    <>
      <Topbar title="Payroll" />
      <div className="space-y-4 p-6">
        <div className="rounded-md border border-line bg-surface px-5 py-3 text-sm text-slate-600">
          Generated automatically for W2 consultants when their timesheet is approved.{" "}
          <span className="tabular font-semibold text-ink">{formatCurrency(due)}</span> due this cycle.
        </div>
        <Card>
          <DataTable
            columns={columns}
            rows={payroll}
            keyFor={(p) => p.id}
            emptyTitle="No payroll records yet"
            emptyHint="These appear when a W2 consultant's timesheet is approved."
          />
        </Card>
      </div>
    </>
  );
}
