"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { calculateClientInvoice } from "@/lib/calculations/invoice";

export async function createClientInvoiceRecord(formData: FormData) {
  const supabase = await createClient();

  const regularHours = Number(formData.get("hours_worked") ?? 0);
  const billRate = Number(formData.get("bill_rate") ?? 0);
  const otAmount = Number(formData.get("ot_amount") ?? 0);
  const taxes = Number(formData.get("taxes") ?? 0);
  const discount = Number(formData.get("discount") ?? 0);

  const calc = calculateClientInvoice({
    regularHours,
    otHours: 0,
    billRate,
    overtimeRate: 0,
    taxes,
    discount,
  });

  const payload = {
    invoice_number: String(formData.get("invoice_number") ?? ""),
    invoice_date: String(formData.get("invoice_date") ?? ""),
    due_date: String(formData.get("due_date") ?? ""),
    client_id: String(formData.get("client_id") ?? ""),
    consultant_id: String(formData.get("consultant_id") ?? ""),
    hours_worked: regularHours,
    bill_rate: billRate,
    regular_amount: calc.regularAmount,
    ot_amount: otAmount,
    taxes: calc.taxes,
    discount: calc.discount,
    po_number: String(formData.get("po_number") ?? "") || null,
    status: String(formData.get("status") ?? "DRAFT"),
  };

  const { error } = await supabase.from("client_invoices").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/invoices/client");
  revalidatePath("/dashboard");
  redirect("/invoices/client");
}
