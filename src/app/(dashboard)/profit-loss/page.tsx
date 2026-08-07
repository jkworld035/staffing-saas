import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { formatCurrency } from "@/lib/calculations/invoice";
import { calculateProfitLoss } from "@/lib/calculations/profitLoss";
import { createClient } from "@/lib/supabase/server";

async function getPLInputs() {
  try {
    const supabase = await createClient();
    const [invoicesRes, vendorRes, payrollRes, expensesRes] = await Promise.all([
      supabase.from("client_invoices").select("grand_total"),
      supabase.from("vendor_invoices").select("amount"),
      supabase.from("payroll").select("gross_pay"),
      supabase.from("other_expenses").select("amount"),
    ]);

    return {
      clientRevenue: (invoicesRes.data ?? []).reduce((s, r) => s + Number(r.grand_total ?? 0), 0),
      vendorCost: (vendorRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0),
      payrollCost: (payrollRes.data ?? []).reduce((s, r) => s + Number(r.gross_pay ?? 0), 0),
      otherExpenses: (expensesRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0),
    };
  } catch {
    return { clientRevenue: 0, vendorCost: 0, payrollCost: 0, otherExpenses: 0 };
  }
}

function Row({ label, value, tone = "default", bold = false }: { label: string; value: number; tone?: "default" | "negative" | "total"; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${tone === "total" ? "border-t border-line pt-4" : ""}`}>
      <span className={bold ? "text-sm font-semibold text-ink" : "text-sm text-slate-600"}>{label}</span>
      <span className={`tabular text-sm ${bold ? "font-semibold text-ink" : "text-ink"} ${tone === "negative" ? "text-danger-600" : ""}`}>
        {tone === "negative" ? "− " : ""}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

export default async function ProfitLossPage() {
  const inputs = await getPLInputs();
  const pl = calculateProfitLoss(inputs);

  return (
    <>
      <Topbar title="Profit & Loss" />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Client revenue" value={formatCurrency(inputs.clientRevenue)} />
          <KpiCard label="Gross profit" value={formatCurrency(pl.grossProfit)} />
          <KpiCard label="Net profit" value={formatCurrency(pl.netProfit)} />
          <KpiCard label="Margin" value={`${pl.marginPct.toFixed(1)}%`} />
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Statement</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-line pt-0">
            <Row label="Client revenue" value={inputs.clientRevenue} bold />
            <Row label="Vendor cost (C2C)" value={inputs.vendorCost} tone="negative" />
            <Row label="Payroll cost (W2)" value={inputs.payrollCost} tone="negative" />
            <Row label="Gross profit" value={pl.grossProfit} tone="total" bold />
            <Row label="Other expenses" value={inputs.otherExpenses} tone="negative" />
            <Row label="Net profit" value={pl.netProfit} tone="total" bold />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
