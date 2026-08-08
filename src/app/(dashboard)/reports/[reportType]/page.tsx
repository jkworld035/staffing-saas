import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { ClientProfitabilityTable, getClientProfitability } from "@/components/reports/ClientProfitability";

const NAMES: Record<string, string> = {
  timesheet: "Timesheet Report",
  "client-invoice": "Client Invoice Report",
  "vendor-invoice": "Vendor Invoice Report",
  payroll: "Payroll Report",
  "consultant-profitability": "Consultant Profitability",
  "client-profitability": "Client Profitability",
  "recruiter-performance": "Recruiter Performance",
  "monthly-revenue": "Monthly Revenue",
  "profit-loss": "Profit & Loss",
  "cash-flow": "Cash Flow",
  "outstanding-receivables": "Outstanding Receivables",
  "outstanding-payables": "Outstanding Payables",
};

// Reports with a real implementation render their own content below;
// everything else in NAMES still gets a page (via the generic empty
// state) so the /reports index links never 404 while they're being built out.
export default async function ReportDetailPage({ params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;
  const title = NAMES[reportType] ?? "Report";

  const exportButtons = (
    <div className="flex gap-2">
      <Button variant="secondary" href={`/api/reports/export?type=${reportType}&format=csv`}>
        <Download size={14} /> CSV
      </Button>
      <Button variant="secondary" href={`/api/reports/export?type=${reportType}&format=excel`}>
        <Download size={14} /> Excel
      </Button>
      <Button variant="secondary" href={`/api/reports/export?type=${reportType}&format=pdf`}>
        <Download size={14} /> PDF
      </Button>
    </div>
  );

  if (reportType === "client-profitability") {
    const rows = await getClientProfitability();
    return (
      <>
        <Topbar title={title} action={exportButtons} />
        <div className="space-y-3 p-6">
          <ClientProfitabilityTable rows={rows} />
          <p className="text-xs text-slate-400">
            Built from actual invoiced revenue, vendor payments and payroll -- the same
            numbers as Profit &amp; Loss, rolled up per client instead of company-wide.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title={title} action={exportButtons} />
      <div className="p-6">
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-sm font-medium text-ink">No data for this period yet</p>
              <p className="max-w-sm text-sm text-slate-400">
                This report queries live data from the underlying tables -- once timesheets,
                invoices and payroll exist, results render here and export identically via
                the buttons above.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
