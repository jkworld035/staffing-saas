import { Search, Bell } from "lucide-react";

export function Topbar({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-slate-400">
          <Search size={15} />
          <span>Search invoices, consultants…</span>
        </div>
        <button className="relative rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-ink">
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger-600" />
        </button>
        {action}
        <div className="h-8 w-8 rounded-full bg-brand-100 text-center text-sm font-semibold leading-8 text-brand-700">
          JK
        </div>
      </div>
    </header>
  );
}
