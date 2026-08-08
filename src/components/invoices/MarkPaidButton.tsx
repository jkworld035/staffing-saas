"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { markVendorInvoicePaid } from "@/app/(dashboard)/invoices/vendor/actions";

export function MarkVendorPaidButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => markVendorInvoicePaid(id))}
      className="flex items-center gap-1 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-600 hover:bg-signal-100 disabled:opacity-50"
      title="Mark this vendor invoice as paid today"
    >
      <CheckCircle2 size={13} /> Mark paid
    </button>
  );
}
