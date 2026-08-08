"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createConsultantRecord(formData: FormData) {
  const supabase = await createClient();

  const employmentType = String(formData.get("employment_type") ?? "W2");

  const payload = {
    consultant_name: String(formData.get("consultant_name") ?? ""),
    employee_id: String(formData.get("employee_id") ?? "") || null,
    employment_type: employmentType,
    client_id: String(formData.get("client_id") ?? "") || null,
    vendor_id: employmentType === "C2C" ? String(formData.get("vendor_id") ?? "") || null : null,
    start_date: String(formData.get("start_date") ?? ""),
    bill_rate: Number(formData.get("bill_rate") ?? 0),
    pay_rate: Number(formData.get("pay_rate") ?? 0),
    vendor_rate: Number(formData.get("vendor_rate") ?? 0),
    overtime_rate: Number(formData.get("overtime_rate") ?? 0),
    currency: String(formData.get("currency") ?? "USD"),
  };

  const { error } = await supabase.from("consultants").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/consultants");
  redirect("/consultants");
}
export async function updateConsultantRecord(id: string, formData: FormData) {
  const supabase = await createClient();

  const employmentType = String(formData.get("employment_type") ?? "W2");

  const payload = {
    consultant_name: String(formData.get("consultant_name") ?? ""),
    employee_id: String(formData.get("employee_id") ?? "") || null,
    employment_type: employmentType,
    client_id: String(formData.get("client_id") ?? "") || null,
    vendor_id: employmentType === "C2C" ? String(formData.get("vendor_id") ?? "") || null : null,
    bill_rate: Number(formData.get("bill_rate") ?? 0),
    pay_rate: Number(formData.get("pay_rate") ?? 0),
    vendor_rate: Number(formData.get("vendor_rate") ?? 0),
    overtime_rate: Number(formData.get("overtime_rate") ?? 0),
    currency: String(formData.get("currency") ?? "USD"),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase.from("consultants").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/consultants");
  redirect("/consultants");
}
