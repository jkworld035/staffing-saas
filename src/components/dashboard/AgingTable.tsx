import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/calculations/invoice";

export interface AgingBucket {
  label: string;
  amount: number;
}

export function AgingTable({ title, buckets }: { title: string; buckets: AgingBucket[] }) {
  const total = buckets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="tabular text-sm font-semibold text-ink">{formatCurrency(total)}</span>
      </CardHeader>
      <CardBody className="pt-3">
        <div className="space-y-3">
          {buckets.map((b) => {
            const pct = total > 0 ? (b.amount / total) * 100 : 0;
            return (
              <div key={b.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">{b.label}</span>
                  <span className="tabular font-medium text-ink">{formatCurrency(b.amount)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-brand-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
