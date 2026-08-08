import { Topbar } from "@/components/layout/Topbar";
import { EditConsultantForm } from "@/components/consultants/EditConsultantForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function EditConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [consultantRes, clientsRes, vendorsRes] = await Promise.all([
    supabase.from("consultants").select("*").eq("id", id).single(),
    supabase.from("clients").select("id, client_name").eq("is_active", true).order("client_name"),
    supabase.from("vendors").select("id, vendor_name").eq("is_active", true).order("vendor_name"),
  ]);

  if (!consultantRes.data) notFound();

  const clients = (clientsRes.data ?? []).map((c) => ({ id: c.id, label: c.client_name }));
  const vendors = (vendorsRes.data ?? []).map((v) => ({ id: v.id, label: v.vendor_name }));

  return (
    <>
      <Topbar title={`Edit ${consultantRes.data.consultant_name}`} />
      <div className="p-6">
        <EditConsultantForm consultant={consultantRes.data} clients={clients} vendors={vendors} />
      </div>
    </>
  );
}
