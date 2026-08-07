import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "signal" | "warn" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  brand: "bg-brand-50 text-brand-700",
  signal: "bg-signal-50 text-signal-600",
  warn: "bg-warn-50 text-warn-600",
  danger: "bg-danger-50 text-danger-600",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

// Maps every status enum in the schema to a consistent color so the same
// state always reads the same way across Timesheets, Invoices, Vendor Invoices, Payroll.
const STATUS_TONE: Record<string, Tone> = {
  PENDING: "warn",
  DRAFT: "neutral",
  SENT: "brand",
  APPROVED: "signal",
  PAID: "signal",
  PROCESSED: "brand",
  OVERDUE: "danger",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>;
}
