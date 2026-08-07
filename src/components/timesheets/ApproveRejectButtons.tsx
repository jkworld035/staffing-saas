"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { setTimesheetStatus } from "@/app/(dashboard)/timesheets/actions";
import { cn } from "@/lib/utils";

export function ApproveRejectButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => setTimesheetStatus(id, "APPROVED"))}
        className={cn(
          "flex items-center gap-1 rounded-md bg-signal-50 px-2.5 py-1 text-xs font-medium text-signal-600",
          "hover:bg-signal-100 disabled:opacity-50"
        )}
        title="Approve — generates invoice, and vendor invoice or payroll automatically"
      >
        <Check size={13} /> Approve
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => setTimesheetStatus(id, "REJECTED"))}
        className="flex items-center gap-1 rounded-md bg-danger-50 px-2.5 py-1 text-xs font-medium text-danger-600 hover:bg-danger-100 disabled:opacity-50"
      >
        <X size={13} /> Reject
      </button>
    </div>
  );
}
