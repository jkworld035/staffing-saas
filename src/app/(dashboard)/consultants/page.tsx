import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/calculations/invoice";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Joined row: consultant + the client/vendor names it's linked to, so margin
// is visible without cross-referencing three separate pages.
interface ConsultantRow {
  id: string;
  consultant_name: string;
  employee_id: string | null;
  employment_type: "W2" | "C2C" | "1099";
  bill_rate: number;
  pay_rate: number;
  vendor_rate: number;
  overtime_rate: number;
  currency: string;
  is_active: boolean;
  client_name: string | null;
  vendor_name: string | null;
}

async function getConsultants(): Promise<ConsultantRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("consultants")
      .select(
        "id, consultant_name, employee_id, employment_type, bill_rate, pay_rate, vendor_rate, overtime_rate, currency, is_active, clients(client_name), vendors(vendor_name)"
      )
      .order("consultant_name");

    return (data ?? []).map((c) => ({
      id: c.id,
      consultant_name: c.consultant_name,
      employee_id: c.employee_id,
      employment_type: c.employment_type,
      bill_rate: c.bill_rate,
      pay_rate: c.pay_rate,
      vendor_rate: c.vendor_rate,
      overtime_rate: c.overtime_rate,
      currency: c.currency,
      is_active: c.is_active,
      // Supabase returns joined singular relations as an object here since
      // client_id/vendor_id are single foreign keys, not one-to-many.
      client_name: (c.clients as unknown as { client_name: string } | null)?.client_name ?? null,
      vendor_name: (c.vendors as unknown as { vendor_name: string } | null)?.vendor_name ?? null,
    }));
  } catch {
    return [];
  }
}

const EMPLOYMENT_TONE = { W2: "brand", C2C: "warn", "1099": "neutral" } as const;

// Margin per hour = what the client pays minus what it costs to staff the
// role (vendor rate for C2C, pay rate for W2/1099) — the number that
// actually determines whether a placement is worth keeping.
function marginPerHour(c: ConsultantRow): number {
  const cost = c.employment_type === "C2C" ? c.vendor_rate : c.pay_rate;
  return c.bill_rate - cost;
}

const columns: Column<ConsultantRow>[] = [
  { header: "Consultant", accessor: (c) => (
      <div>
        <p className="font-medium">{c.consultant_name}</p>
        <p className="text-xs text-slate-400">{c.employee_id ?? "No employee ID"}</p>
      </div>
    ) },
  { header: "Client", accessor: (c) => c.client_name ?? <span className="text-slate-400">Unassigned</span> },
  { header: "Vendor", accessor: (c) =>
      c.employment_type === "C2C"
        ? (c.vendor_name ?? <span className="text-danger-600">Missing</span>)
        : <span className="text-slate-400">—</span> },
  { header: "Type", accessor: (c) => <Badge tone={EMPLOYMENT_TONE[c.employment_type]}>{c.employment_type}</Badge> },
  { header: "Bill rate", accessor: (c) => formatCurrency(c.bill_rate, c.currency), align: "right" },
  { header: "Cost rate", accessor: (c) =>
      formatCurrency(c.employment_type === "C2C" ? c.vendor_rate : c.pay_rate, c.currency), align: "right" },
  { header: "Margin/hr", accessor: (c) => {
      const margin = marginPerHour(c);
      return (
        <span className={margin >= 0 ? "font-semibold text-signal-600" : "font-semibold text-danger-600"}>
          {formatCurrency(margin, c.currency)}
        </span>
      );
    }, align: "right" },
  { header: "Status", accessor: (c) => <Badge tone={c.is_active ? "signal" : "neutral"}>{c.is_active ? "Active" : "Ended"}</Badge> },
  { header: "", accessor: (c) => (
      <a href={`/consultants/${c.id}/edit`} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
        <Pencil size={12} /> Edit
      </a>
    ), align: "right" },
];

export default async function ConsultantsPage() {
  const consultants = await getConsultants();

  return (
    <>
      <Topbar
        title="Consultants"
        action={
          <Button href="/consultants/new">
            <Plus size={15} /> New consultant
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <DataTable
            columns={columns}
            rows={consultants}
            keyFor={(c) => c.id}
            emptyTitle="No consultants yet"
            emptyHint="Add a consultant and assign them to a client to start logging timesheets."
          />
        </Card>
        <p className="mt-3 text-xs text-slate-400">
          Margin/hr = bill rate minus vendor rate (C2C) or pay rate (W2 · 1099) — what's actually left after paying for the placement.
        </p>
      </div>
    </>
  );
}