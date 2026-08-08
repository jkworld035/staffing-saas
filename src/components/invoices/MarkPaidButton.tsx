"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Calendar } from "lucide-react";
import { markVendorInvoicePaid } from "@/app/(dashboard)/invoices/vendor/actions";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MarkVendorPaidButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(today());
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-600 hover:bg-signal-100"
      >
        <CheckCircle2 size={13} /> Mark paid
      </button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="flex items-center gap-1 rounded-md border border-line bg-white px-1.5 py-1">
        <Calendar size={12} className="text-slate-400" />
        <input
          type="date"
          value={paidDate}
          max={today()}
          onChange={(e) => setPaidDate(e.target.value)}
          className="w-[110px] border-0 p-0 text-xs text-ink focus:outline-none"
        />
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => markVendorInvoicePaid(id, paidDate))}
        className="rounded-md bg-signal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-signal-700 disabled:opacity-50"
      >
        Confirm
      </button>
      <button
        disabled={isPending}
        onClick={() => setOpen(false)}
        className="rounded-md px-1.5 py-1 text-xs text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
    </div>
  );
}
