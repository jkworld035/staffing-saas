import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/calculations/invoice";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Consultant } from "@/types/database.types";

async function getConsultants(): Promise<Consultant[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("consultants").select("*").order("consultant_name");
    return data ?? [];
  } catch {
    return [];
  }
}

const EMPLOYMENT_TONE = { W2: "brand", C2C: "warn", "1099": "neutral" } as const;

const columns: Column<Consultant>[] = [
  { header: "Consultant", accessor: (c) => (
      <div>
        <p className="font-medium">{c.consultant_name}</p>
        <p className="text-xs text-slate-400">{c.employee_id ?? "No employee ID"}</p>
      </div>
    ) },
  { header: "Type", accessor: (c) => <Badge tone={EMPLOYMENT_TONE[c.employment_type]}>{c.employment_type}</Badge> },
  { header: "Bill rate", accessor: (c) => formatCurrency(c.bill_rate, c.currency), align: "right" },
  { header: "Pay / Vendor rate", accessor: (c) =>
      formatCurrency(c.employment_type === "C2C" ? c.vendor_rate : c.pay_rate, c.currency), align: "right" },
  { header: "OT rate", accessor: (c) => formatCurrency(c.overtime_rate, c.currency), align: "right" },
  { header: "Status", accessor: (c) => <Badge tone={c.is_active ? "signal" : "neutral"}>{c.is_active ? "Active" : "Ended"}</Badge> },
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
      </div>
    </>
  );
}
