import { Topbar } from "@/components/layout/Topbar";
import { KpiCard } from "@/components/ui/KpiCard";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { ProfitChart, type ProfitPoint } from "@/components/dashboard/ProfitChart";
import { AgingTable } from "@/components/dashboard/AgingTable";
import { RankedList } from "@/components/dashboard/RankedList";
import { formatCurrency } from "@/lib/calculations/invoice";
import { calculateProfitLoss } from "@/lib/calculations/profitLoss";
import { createClient } from "@/lib/supabase/server";

// All numbers on this page come straight from client_invoices / vendor_invoices /
// payroll / timesheets — nothing is stored redundantly, matching MODULE 7 + 8 spec.
async function getDashboardData() {
  const empty = {
    todayRevenue: 0,
    monthRevenue: 0,
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
      { label: "0–15 days", amount: 0 },
      { label: "16–30 days", amount: 0 },
      { label: "31–45 days", amount: 0 },
      { label: "45+ days", amount: 0 },
    ],
    topClients: [] as { name: string; value: number }[],
    topConsultants: [] as { name: string; value: number }[],
  };

  try {
    const supabase = await createClient();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const [invoicesRes, vendorRes, payrollRes, consultantsRes, clientsRes] = await Promise.all([
      supabase.from("client_invoices").select("*"),
      supabase.from("vendor_invoices").select("*"),
      supabase.from("payroll").select("*"),
      supabase.from("consultants").select("id").eq("is_active", true),
      supabase.from("clients").select("id, client_name").eq("is_active", true),
    ]);

    const invoices = invoicesRes.data ?? [];
    const vendorInvoices = vendorRes.data ?? [];
    const payrollRows = payrollRes.data ?? [];

    const monthRevenue = invoices
      .filter((i) => new Date(i.invoice_date) >= startOfMonth)
      .reduce((sum, i) => sum + Number(i.grand_total ?? 0), 0);

    const outstandingInvoices = invoices
      .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
      .reduce((sum, i) => sum + Number(i.grand_total ?? 0), 0);

    const pendingVendorPayments = vendorInvoices
      .filter((v) => v.status === "PENDING" || v.status === "APPROVED")
      .reduce((sum, v) => sum + Number(v.amount ?? 0), 0);

    const payrollDue = payrollRows
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + Number(p.net_pay ?? 0), 0);

    const revenueByClient = new Map<string, number>();
    invoices.forEach((i) => {
      revenueByClient.set(i.client_id, (revenueByClient.get(i.client_id) ?? 0) + Number(i.grand_total ?? 0));
    });
    const clientNameMap = new Map((clientsRes.data ?? []).map((c) => [c.id, c.client_name]));
    const topClients = [...revenueByClient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, value]) => ({ name: clientNameMap.get(id) ?? "Unknown client", value }));

    return {
      ...empty,
      monthRevenue,
      outstandingInvoices,
      pendingVendorPayments,
      payrollDue,
      activeConsultants: consultantsRes.data?.length ?? 0,
      activeClients: clientsRes.data?.length ?? 0,
      topClients,
    };
  } catch {
    // Supabase not configured yet — render the empty-state dashboard instead of crashing.
    return empty;
  }
}

export default async function DashboardPage() {
  const d = await getDashboardData();
  const pl = calculateProfitLoss({
    clientRevenue: d.monthRevenue,
    vendorCost: d.pendingVendorPayments,
    payrollCost: d.payrollDue,
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
          <KpiCard label="Billable hours" value={d.billableHours.toLocaleString()} hint="Non-billable tracked separately" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <RevenueChart data={d.revenueTrend} />
          <ProfitChart data={d.profitTrend} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <AgingTable title="Invoice aging" buckets={d.invoiceAging} />
          <RankedList title="Top clients by revenue" items={d.topClients} emptyLabel="No invoiced revenue yet." />
          <RankedList title="Top consultants" items={d.topConsultants} emptyLabel="No invoiced revenue yet." />
        </div>
      </div>
    </>
  );
}
