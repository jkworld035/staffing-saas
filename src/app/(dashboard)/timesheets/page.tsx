import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ApproveRejectButtons } from "@/components/timesheets/ApproveRejectButtons";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Timesheet } from "@/types/database.types";

async function getTimesheets(): Promise<Timesheet[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("timesheets")
      .select("*")
      .order("week_start", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function TimesheetsPage() {
  const timesheets = await getTimesheets();

  const columns: Column<Timesheet>[] = [
    { header: "Week", accessor: (t) => `${formatDate(t.week_start)} – ${formatDate(t.week_end)}` },
    { header: "Reg.", accessor: (t) => t.regular_hours, align: "right" },
    { header: "OT", accessor: (t) => t.ot_hours, align: "right" },
    { header: "Holiday", accessor: (t) => t.holiday_hours, align: "right" },
    { header: "PTO", accessor: (t) => t.pto_hours, align: "right" },
    { header: "Total", accessor: (t) => <span className="font-semibold">{t.total_hours}</span>, align: "right" },
    { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
    {
      header: "",
      accessor: (t) => (t.status === "PENDING" ? <ApproveRejectButtons id={t.id} /> : null),
      align: "right",
    },
  ];

  return (
    <>
      <Topbar
        title="Timesheets"
        action={
          <Button href="/timesheets/submit">
            <Plus size={15} /> Submit timesheet
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <DataTable
            columns={columns}
            rows={timesheets}
            keyFor={(t) => t.id}
            emptyTitle="No timesheets yet"
            emptyHint="Once a consultant submits hours, they'll show up here for approval."
          />
        </Card>
        <p className="mt-3 text-xs text-slate-400">
          Approving a timesheet automatically generates the client invoice, plus a vendor
          invoice (C2C) or payroll record (W2) — no manual step required.
        </p>
      </div>
    </>
  );
}
