import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { FileSpreadsheet, ArrowRight } from "lucide-react";

const REPORTS = [
  { slug: "timesheet", name: "Timesheet Report", desc: "Hours by consultant, client and status" },
  { slug: "client-invoice", name: "Client Invoice Report", desc: "Billed amounts, aging and collections" },
  { slug: "vendor-invoice", name: "Vendor Invoice Report", desc: "C2C vendor payables and status" },
  { slug: "payroll", name: "Payroll Report", desc: "Gross/net pay by consultant and period" },
  { slug: "consultant-profitability", name: "Consultant Profitability", desc: "Margin per consultant" },
  { slug: "client-profitability", name: "Client Profitability", desc: "Margin per client" },
  { slug: "recruiter-performance", name: "Recruiter Performance", desc: "Placements and revenue by recruiter" },
  { slug: "monthly-revenue", name: "Monthly Revenue", desc: "Revenue trend by month" },
  { slug: "profit-loss", name: "Profit & Loss", desc: "Full P&L statement by period" },
  { slug: "cash-flow", name: "Cash Flow", desc: "Cash in vs. cash out" },
  { slug: "outstanding-receivables", name: "Outstanding Receivables", desc: "Unpaid client invoices" },
  { slug: "outstanding-payables", name: "Outstanding Payables", desc: "Unpaid vendor invoices & payroll" },
];

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports" />
      <div className="grid grid-cols-3 gap-4 p-6">
        {REPORTS.map((r) => (
          <Link key={r.slug} href={`/reports/${r.slug}`}>
            <Card className="group h-full transition-colors hover:border-brand-600">
              <div className="flex items-start justify-between p-5">
                <div>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <FileSpreadsheet size={17} />
                  </div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{r.desc}</p>
                </div>
                <ArrowRight size={16} className="mt-1 text-slate-300 group-hover:text-brand-600" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
