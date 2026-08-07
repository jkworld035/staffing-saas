import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/calculations/invoice";

export interface RankedItem {
  name: string;
  value: number;
  sub?: string;
}

export function RankedList({ title, items, emptyLabel }: { title: string; items: RankedItem[]; emptyLabel: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody className="pt-2">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          <ol className="space-y-3">
            {items.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[11px] font-semibold text-slate-600">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  {item.sub && <p className="text-xs text-slate-400">{item.sub}</p>}
                </div>
                <span className="tabular text-sm font-semibold text-ink">{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
