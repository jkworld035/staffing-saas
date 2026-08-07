import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  hint?: string;
}

export function KpiCard({ label, value, delta, hint }: KpiCardProps) {
  return (
    <Card>
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="tabular text-2xl font-semibold text-ink">{value}</p>
          {delta && (
            <span
              className={cn(
                "text-xs font-medium",
                delta.positive ? "text-signal-600" : "text-danger-600"
              )}
            >
              {delta.positive ? "▲" : "▼"} {delta.value}
            </span>
          )}
        </div>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}
