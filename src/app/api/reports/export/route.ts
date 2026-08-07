import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Maps report slug -> table + columns to export. Extend as each report's exact
// column set is finalized; the CSV/Excel/PDF branches all read from this map
// so adding a report to reports/page.tsx only requires one entry here.
const REPORT_SOURCES: Record<string, { table: string; columns: string[] }> = {
  timesheet: { table: "timesheets", columns: ["week_start", "week_end", "regular_hours", "ot_hours", "total_hours", "status"] },
  "client-invoice": { table: "client_invoices", columns: ["invoice_number", "invoice_date", "due_date", "grand_total", "status"] },
  "vendor-invoice": { table: "vendor_invoices", columns: ["invoice_number", "invoice_date", "due_date", "amount", "status"] },
  payroll: { table: "payroll", columns: ["pay_period_start", "pay_period_end", "gross_pay", "net_pay", "status"] },
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
  const source = REPORT_SOURCES[type];

  if (!source) {
    return NextResponse.json({ error: `Unknown report type: ${type}` }, { status: 400 });
  }

  if (format !== "csv") {
    // Excel/PDF rendering share the same query — wire in exceljs / the pdf skill's
    // pipeline here once a concrete report layout is approved. CSV is fully
    // implemented since every downstream tool can consume it as an interim format.
    return NextResponse.json(
      { error: `${format} export not yet implemented — use CSV for now` },
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
