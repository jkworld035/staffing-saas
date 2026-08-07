import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400",
        "focus:border-brand-600",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink",
        "focus:border-brand-600",
        className
      )}
      {...props}
    />
  );
}
