import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientProfitability } from "@/components/reports/ClientProfitability";
import { round2 } from "@/lib/calculations/invoice";

const REPORT_SOURCES: Record<string, { table: string; columns: string[] }> = {
  timesheet: { table: "timesheets", columns: ["week_start", "week_end", "regular_hours", "ot_hours", "total_hours", "status"] },
  "client-invoice": { table: "client_invoices", columns: ["invoice_number", "invoice_date", "due_date", "grand_total", "status"] },
  "vendor-invoice": { table: "vendor_invoices", columns: ["invoice_number", "invoice_date", "due_date", "amount", "status"] },
  payroll: { table: "payroll", columns: ["pay_period_start", "pay_period_end", "gross_pay", "net_pay", "status"] },
};

const COMPUTED_REPORT_EXPORTS: Record<string, () => Promise<string>> = {
  "client-profitability": async () => {
    const rows = await getClientProfitability();
    const columns = ["clientName", "consultantCount", "revenue", "vendorCost", "payrollCost", "grossProfit", "netProfit", "marginPct"];
    return toCsv(
      rows.map((r) => ({ ...r, marginPct: round2(r.marginPct) })) as unknown as Record<string, unknown>[],
      columns
    );
  },
};

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((c) => JSON.stringify(row[c] ?? "")).join(","))
    .join("\n");
  return [header, body].filter(Boolean).join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "";
  const format = searchParams.get("format") ?? "csv";

  const computedExport = COMPUTED_REPORT_EXPORTS[type];
  if (computedExport) {
    if (format !== "csv") {
      return NextResponse.json(
        { error: `${format} export not yet implemented -- use CSV for now` },
        { status: 501 }
      );
    }
    const csv = await computedExport();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
      },
    });
  }

  const source = REPORT_SOURCES[type];

  if (!source) {
    return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 });
  }

  if (format !== "csv") {
    return NextResponse.json(
      { error: `${format} export not yet implemented -- use CSV for now` },
      { status: 501 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(source.table).select(source.columns.join(","));
    if (error) throw error;

    const csv = toCsv((data ?? []) as unknown as Record<string, unknown>[], source.columns);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
      },
    });
  } catch {
    return new NextResponse(toCsv([], source.columns), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
      },
    });
  }
}
