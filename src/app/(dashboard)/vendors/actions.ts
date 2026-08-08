"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createVendorRecord(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    vendor_name: String(formData.get("vendor_name") ?? ""),
    company: String(formData.get("company") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    payment_terms: String(formData.get("payment_terms") ?? "NET_30"),
  };

  const { error } = await supabase.from("vendors").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/vendors");
  revalidatePath("/consultants/new");
  redirect("/vendors");
}
export async function updateVendorRecord(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    vendor_name: String(formData.get("vendor_name") ?? ""),
    company: String(formData.get("company") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    payment_terms: String(formData.get("payment_terms") ?? "NET_30"),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = await supabase.from("vendors").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendors");
  redirect("/vendors");
}
