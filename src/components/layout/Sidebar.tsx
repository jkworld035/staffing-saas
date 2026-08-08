"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Truck,
  Clock,
  FileText,
  Receipt,
  Wallet,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/consultants", label: "Consultants", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Truck },
  { href: "/timesheets", label: "Timesheets", icon: Clock },
  { href: "/invoices/client", label: "Client Invoices", icon: FileText },
  { href: "/invoices/vendor", label: "Vendor Invoices", icon: Receipt },
  { href: "/payroll", label: "Payroll", icon: Wallet },
  { href: "/profit-loss", label: "Profit & Loss", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-ink text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-sm font-bold">
          S
        </div>
        <span className="text-sm font-semibold tracking-tight">StaffLedger</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-slate-400">Pipeline</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Timesheet -&gt; Invoice -&gt; Vendor Pay -&gt; Payroll -&gt; P&amp;L
        </p>
      </div>
    </aside>
  );
}
