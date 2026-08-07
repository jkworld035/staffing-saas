"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_name: String(formData.get("client_name") ?? ""),
    company: String(formData.get("company") ?? ""),
    billing_contact: String(formData.get("billing_contact") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    currency: String(formData.get("currency") ?? "USD"),
    billing_cycle: String(formData.get("billing_cycle") ?? "MONTHLY"),
    payment_terms: String(formData.get("payment_terms") ?? "NET_30"),
    purchase_order: String(formData.get("purchase_order") ?? "") || null,
  };

  const { error } = await supabase.from("clients").insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  redirect("/clients");
}
