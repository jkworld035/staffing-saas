"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markVendorInvoicePaid(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendor_invoices")
    .update({ status: "PAID", paid_date: new Date().toISOString().slice(0, 10) })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/invoices/vendor");
  revalidatePath("/dashboard");
  revalidatePath("/profit-loss");
}
