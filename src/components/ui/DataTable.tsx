import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyTitle: string;
  emptyHint: string;
  keyFor: (row: T) => string;
}

export function DataTable<T>({ columns, rows, emptyTitle, emptyHint, keyFor }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="text-sm font-medium text-ink">{emptyTitle}</p>
        <p className="text-sm text-slate-400">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400",
                  col.align === "right" && "text-right"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyFor(row)} className="border-b border-line last:border-0 hover:bg-slate-50">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn(
                    "px-5 py-3 text-ink",
                    col.align === "right" && "text-right tabular",
                    col.className
                  )}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
