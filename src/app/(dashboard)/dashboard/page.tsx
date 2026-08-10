import { Topbar } from "@/components/layout/Topbar";
import { KpiCard } from "@/components/ui/KpiCard";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { ProfitChart, type ProfitPoint } from "@/components/dashboard/ProfitChart";
import { AgingTable } from "@/components/dashboard/AgingTable";
import { RankedList } from "@/components/dashboard/RankedList";
import { formatCurrency } from "@/lib/calculations/invoice";
import { calculateProfitLoss } from "@/lib/calculations/profitLoss";
import { createClient } from "@/lib/supabase/server";

const MONTH_LABEL = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

async function getDashboardData() {
  const empty = {
    monthRevenue: 0,
    monthVendorCost: 0,
    monthPayrollCost: 0,
    outstandingInvoices: 0,
    pendingVendorPayments: 0,
    payrollDue: 0,
    activeConsultants: 0,
    activeClients: 0,
    billableHours: 0,
    nonBillableHours: 0,
    revenueTrend: [] as RevenuePoint[],
    profitTrend: [] as ProfitPoint[],
    invoiceAging: [
      { label: "0-15 days", amount: 0 },
      { label: "16-30 days", amount: 0 },
      { label: "31-45 days", amount: 0 },
      { label: "45+ days", amount: 0 },
    ],
    invoicesByStatus: [] as { label: string; amount: number }[],
    topClients: [] as { name: string; value: number }[],
    topConsultants: [] as { name: string; value: number }[],
  };

  try {
    const supabase = await createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [invoicesRes, vendorRes, payrollRes, consultantsRes, clientsRes, timesheetsRes] = await Promise.all([
      supabase.from("client_invoices").select("*"),
      supabase.from("vendor_invoices").select("*"),
      supabase.from("payroll").select("*"),
      supabase.from("consultants").select("id, consultant_name").eq("is_active", true),
      supabase.from("clients").select("id, client_name").eq("is_active", true),
      supabase.from("timesheets").select("total_hours, ot_hours, holiday_hours, pto_hours, week_start, status").eq("status", "APPROVED"),
    ]);

    const invoices = invoicesRes.data ?? [];
    const vendorInvoices = vendorRes.data ?? [];
    const payrollRows = payrollRes.data ?? [];
    const timesheets = timesheetsRes.data ?? [];
    const consultantNameMap = new Map((consultantsRes.data ?? []).map((c) => [c.id, c.consultant_name]));
    const clientNameMap = new Map((clientsRes.data ?? []).map((c) => [c.id, c.client_name]));

    const monthRevenue = invoices
      .filter((i) => new Date(i.invoice_date) >= startOfMonth)
      .reduce((sum, i) => sum + Number(i.grand_total ?? 0), 0);

    const monthVendorCost = vendorInvoices
      .filter((v) => new Date(v.invoice_date) >= startOfMonth)
      .reduce((sum, v) => sum + Number(v.amount ?? 0), 0);

    const monthPayrollCost = payrollRows
      .filter((p) => new Date(p.pay_period_start) >= startOfMonth)
      .reduce((sum, p) => sum + Number(p.gross_pay ?? 0), 0);

    const outstandingInvoices = invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + Number(i.grand_total ?? 0), 0);

    const pendingVendorPayments = vendorInvoices
      .filter((v) => v.status === "PENDING" || v.status === "APPROVED")
      .reduce((sum, v) => sum + Number(v.amount ?? 0), 0);

    const payrollDue = payrollRows
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + Number(p.net_pay ?? 0), 0);

    const months: { key: string; label: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d });
    }

    const revenueByMonth = new Map<string, number>();
    invoices.forEach((i) => {
      const k = monthKey(i.invoice_date);
      revenueByMonth.set(k, (revenueByMonth.get(k) ?? 0) + Number(i.grand_total ?? 0));
    });

    const vendorCostByMonth = new Map<string, number>();
    vendorInvoices.forEach((v) => {
      const k = monthKey(v.invoice_date);
      vendorCostByMonth.set(k, (vendorCostByMonth.get(k) ?? 0) + Number(v.amount ?? 0));
    });

    const payrollCostByMonth = new Map<string, number>();
    payrollRows.forEach((p) => {
      const k = monthKey(p.pay_period_start);
      payrollCostByMonth.set(k, (payrollCostByMonth.get(k) ?? 0) + Number(p.gross_pay ?? 0));
    });

    const revenueTrend: RevenuePoint[] = months.map(({ key, label }) => {
      const revenue = revenueByMonth.get(key) ?? 0;
      const cost = (vendorCostByMonth.get(key) ?? 0) + (payrollCostByMonth.get(key) ?? 0);
      return { month: MONTH_LABEL(label), revenue, cost };
    });

    const profitTrend: ProfitPoint[] = revenueTrend.map((r) => {
      const profit = r.revenue - r.cost;
      const margin = r.revenue > 0 ? (profit / r.revenue) * 100 : 0;
      return { month: r.month, profit, margin };
    });

    const hasAnyRevenue = revenueTrend.some((r) => r.revenue > 0);

    const revenueByClient = new Map<string, number>();
    const revenueByConsultant = new Map<string, number>();
    invoices.forEach((i) => {
      revenueByClient.set(i.client_id, (revenueByClient.get(i.client_id) ?? 0) + Number(i.grand_total ?? 0));
      revenueByConsultant.set(i.consultant_id, (revenueByConsultant.get(i.consultant_id) ?? 0) + Number(i.grand_total ?? 0));
    });

    const topClients = [...revenueByClient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => ({ name: clientNameMap.get(id) ?? "Unknown client", value }));

    const topConsultants = [...revenueByConsultant.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => ({ name: consultantNameMap.get(id) ?? "Unknown consultant", value }));

    const aging = { b0: 0, b16: 0, b31: 0, b45: 0 };
    invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .forEach((i) => {
        const daysPastDue = Math.floor((now.getTime() - new Date(i.due_date).getTime()) / 86400000);
        const amt = Number(i.grand_total ?? 0);
        if (daysPastDue <= 15) aging.b0 += amt;
        else if (daysPastDue <= 30) aging.b16 += amt;
        else if (daysPastDue <= 45) aging.b31 += amt;
        else aging.b45 += amt;
      });

    const invoiceAging = [
      { label: "0-15 days", amount: aging.b0 },
      { label: "16-30 days", amount: aging.b16 },
      { label: "31-45 days", amount: aging.b31 },
      { label: "45+ days", amount: aging.b45 },
    ];

    const statusTotals = new Map<string, number>();
    invoices.forEach((i) => {
      statusTotals.set(i.status, (statusTotals.get(i.status) ?? 0) + Number(i.grand_total ?? 0));
    });
    const STATUS_ORDER = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
    const invoicesByStatus = STATUS_ORDER
      .filter((s) => statusTotals.has(s))
      .map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), amount: statusTotals.get(s) ?? 0 }));

    const thisMonthTimesheets = timesheets.filter((t) => new Date(t.week_start) >= startOfMonth);
    const billableHours = thisMonthTimesheets.reduce((sum, t) => sum + Number(t.total_hours ?? 0) - Number(t.holiday_hours ?? 0) - Number(t.pto_hours ?? 0), 0);
    const nonBillableHours = thisMonthTimesheets.reduce((sum, t) => sum + Number(t.holiday_hours ?? 0) + Number(t.pto_hours ?? 0), 0);

    return {
      ...empty,
      monthRevenue,
      monthVendorCost,
      monthPayrollCost,
      outstandingInvoices,
      pendingVendorPayments,
      payrollDue,
      activeConsultants: consultantsRes.data?.length ?? 0,
      activeClients: clientsRes.data?.length ?? 0,
      billableHours,
      nonBillableHours,
      revenueTrend: hasAnyRevenue ? revenueTrend : [],
      profitTrend: hasAnyRevenue ? profitTrend : [],
      invoiceAging,
      invoicesByStatus,
      topClients,
      topConsultants,
    };
  } catch {
    return empty;
  }
}

export default async function DashboardPage() {
  const d = await getDashboardData();
  const pl = calculateProfitLoss({
    clientRevenue: d.monthRevenue,
    vendorCost: d.monthVendorCost,
    payrollCost: d.monthPayrollCost,
  });

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Revenue this month" value={formatCurrency(d.monthRevenue)} />
          <KpiCard label="Outstanding invoices" value={formatCurrency(d.outstandingInvoices)} />
          <KpiCard label="Pending vendor payments" value={formatCurrency(d.pendingVendorPayments)} />
          <KpiCard label="Payroll due" value={formatCurrency(d.payrollDue)} />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Active consultants" value={String(d.activeConsultants)} />
          <KpiCard label="Active clients" value={String(d.activeClients)} />
          <KpiCard
            label="Net profit (this month)"
            value={formatCurrency(pl.netProfit)}
            hint={`${pl.marginPct.toFixed(1)}% margin`}
          />
          <KpiCard
            label="Billable hours"
            value={d.billableHours.toLocaleString()}
            hint={`${d.nonBillableHours.toLocaleString()} non-billable this month`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <RevenueChart data={d.revenueTrend} />
          <ProfitChart data={d.profitTrend} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <AgingTable title="Invoice aging" buckets={d.invoiceAging} />
          <AgingTable title="Invoices by status" buckets={d.invoicesByStatus} />
          <RankedList title="Top clients by revenue" items={d.topClients} emptyLabel="No invoiced revenue yet." />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <RankedList title="Top consultants by revenue" items={d.topConsultants} emptyLabel="No invoiced revenue yet." />
        </div>
      </div>
    </>
  );
}
