import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-ink border border-line hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

export function Button({ variant = "primary", className, href, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
