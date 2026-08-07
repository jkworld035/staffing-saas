import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

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

export default async function ReportDetailPage({ params }: { params: Promise<{ reportType: string }> }) {
  const { reportType } = await params;
  const title = NAMES[reportType] ?? "Report";

  return (
    <>
      <Topbar
        title={title}
        action={
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
        }
      />
      <div className="p-6">
        <Card>
          <CardBody>
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
              <p className="text-sm font-medium text-ink">No data for this period yet</p>
              <p className="max-w-sm text-sm text-slate-400">
                This report queries live data from the underlying tables — once timesheets,
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
