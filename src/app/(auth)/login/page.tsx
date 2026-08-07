import { Field, Input } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-base font-bold text-white">
            S
          </div>
          <span className="text-lg font-semibold text-white">StaffLedger</span>
        </div>

        <div className="rounded-lg border border-white/10 bg-surface p-6 shadow-panel">
          <h1 className="mb-1 text-lg font-semibold text-ink">Sign in</h1>
          <p className="mb-6 text-sm text-slate-400">Timesheets, billing and payroll in one place.</p>

          <form action={signIn} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </Field>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
