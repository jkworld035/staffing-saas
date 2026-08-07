"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitTimesheet(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    consultant_id: String(formData.get("consultant_id") ?? ""),
    client_id: String(formData.get("client_id") ?? ""),
    week_start: String(formData.get("week_start") ?? ""),
    week_end: String(formData.get("week_end") ?? ""),
    regular_hours: Number(formData.get("regular_hours") ?? 0),
    ot_hours: Number(formData.get("ot_hours") ?? 0),
    holiday_hours: Number(formData.get("holiday_hours") ?? 0),
    pto_hours: Number(formData.get("pto_hours") ?? 0),
    comments: String(formData.get("comments") ?? "") || null,
    status: "PENDING" as const,
  };

  const { error } = await supabase.from("timesheets").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/timesheets");
  redirect("/timesheets");
}

// Flipping status to APPROVED fires trg_timesheet_approved in Postgres, which
// creates the Client Invoice, and — depending on employment_type — the Vendor
// Invoice or Payroll record, in a single transaction. No app-side fan-out needed.
export async function setTimesheetStatus(id: string, status: "APPROVED" | "REJECTED") {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("timesheets").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/timesheets");
  revalidatePath("/invoices/client");
  revalidatePath("/invoices/vendor");
  revalidatePath("/payroll");
  revalidatePath("/dashboard");
}
