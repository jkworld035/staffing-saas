import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/calculations/invoice";
import { calculateProfitLoss } from "@/lib/calculations/profitLoss";
import { createClient } from "@/lib/supabase/server";

export interface ClientProfitabilityRow {
  clientId: string;
  clientName: string;
  consultantCount: number;
  revenue: number;
  vendorCost: number;
  payrollCost: number;
  otherExpenses: number;
  grossProfit: number;
  netProfit: number;
  marginPct: number;
}

// v_profit_loss (from the schema) is already grouped by client_id + month.
// PostgREST can't re-aggregate a view across periods in one call, so we pull
// every period's row and roll it up client-side -- fine at this data volume,
// and it means this report and /profit-loss always agree, since they read
// from the same source of truth instead of duplicating the math.
export async function getClientProfitability(): Promise<ClientProfitabilityRow[]> {
  try {
    const supabase = await createClient();

    const [plRes, clientsRes, consultantsRes] = await Promise.all([
      supabase.from("v_profit_loss").select("client_id, client_revenue, vendor_cost, payroll_cost, other_expenses"),
      supabase.from("clients").select("id, client_name"),
      supabase.from("consultants").select("client_id").eq("is_active", true),
    ]);

    const clientNames = new Map((clientsRes.data ?? []).map((c) => [c.id, c.client_name]));

    const consultantCounts = new Map<string, number>();
    (consultantsRes.data ?? []).forEach((c) => {
      if (!c.client_id) return;
      consultantCounts.set(c.client_id, (consultantCounts.get(c.client_id) ?? 0) + 1);
    });

    const totals = new Map<string, { revenue: number; vendorCost: number; payrollCost: number; otherExpenses: number }>();
    (plRes.data ?? []).forEach((row) => {
      const existing = totals.get(row.client_id) ?? { revenue: 0, vendorCost: 0, payrollCost: 0, otherExpenses: 0 };
      existing.revenue += Number(row.client_revenue ?? 0);
      existing.vendorCost += Number(row.vendor_cost ?? 0);
      existing.payrollCost += Number(row.payroll_cost ?? 0);
      existing.otherExpenses += Number(row.other_expenses ?? 0);
      totals.set(row.client_id, existing);
    });

    const rows: ClientProfitabilityRow[] = [...totals.entries()].map(([clientId, t]) => {
      const pl = calculateProfitLoss({
        clientRevenue: t.revenue,
        vendorCost: t.vendorCost,
        payrollCost: t.payrollCost,
        otherExpenses: t.otherExpenses,
      });
      return {
        clientId,
        clientName: clientNames.get(clientId) ?? "Unknown client",
        consultantCount: consultantCounts.get(clientId) ?? 0,
        revenue: t.revenue,
        vendorCost: t.vendorCost,
        payrollCost: t.payrollCost,
        otherExpenses: t.otherExpenses,
        grossProfit: pl.grossProfit,
        netProfit: pl.netProfit,
        marginPct: pl.marginPct,
      };
    });

    return rows.sort((a, b) => b.netProfit - a.netProfit);
  } catch {
    return [];
  }
}

const columns: Column<ClientProfitabilityRow>[] = [
  { header: "Client", accessor: (r) => (
      <div>
        <p className="font-medium">{r.clientName}</p>
        <p className="text-xs text-slate-400">{r.consultantCount} active consultant{r.consultantCount === 1 ? "" : "s"}</p>
      </div>
    ) },
  { header: "Revenue", accessor: (r) => formatCurrency(r.revenue), align: "right" },
  { header: "Vendor cost", accessor: (r) => formatCurrency(r.vendorCost), align: "right" },
  { header: "Payroll cost", accessor: (r) => formatCurrency(r.payrollCost), align: "right" },
  { header: "Gross profit", accessor: (r) => formatCurrency(r.grossProfit), align: "right" },
  { header: "Net profit", accessor: (r) => {
      const positive = r.netProfit >= 0;
      return <span className={positive ? "font-semibold text-signal-600" : "font-semibold text-danger-600"}>{formatCurrency(r.netProfit)}</span>;
    }, align: "right" },
  { header: "Margin", accessor: (r) => `${r.marginPct.toFixed(1)}%`, align: "right" },
];

export function ClientProfitabilityTable({ rows }: { rows: ClientProfitabilityRow[] }) {
  return (
    <Card>
      <DataTable
        columns={columns}
        rows={rows}
        keyFor={(r) => r.clientId}
        emptyTitle="No billed data yet"
        emptyHint="This fills in once at least one timesheet has been approved and invoiced for a client."
      />
    </Card>
  );
}
