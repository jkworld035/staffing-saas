import { Topbar } from "@/components/layout/Topbar";
import { ConsultantForm } from "@/components/consultants/ConsultantForm";
import { createClient } from "@/lib/supabase/server";

async function getOptions() {
  try {
    const supabase = await createClient();
    const [clientsRes, vendorsRes] = await Promise.all([
      supabase.from("clients").select("id, client_name").eq("is_active", true).order("client_name"),
      supabase.from("vendors").select("id, vendor_name").eq("is_active", true).order("vendor_name"),
    ]);

    return {
      clients: (clientsRes.data ?? []).map((c) => ({ id: c.id, label: c.client_name })),
      vendors: (vendorsRes.data ?? []).map((v) => ({ id: v.id, label: v.vendor_name })),
    };
  } catch {
    return { clients: [], vendors: [] };
  }
}

export default async function NewConsultantPage() {
  const { clients, vendors } = await getOptions();

  return (
    <>
      <Topbar title="New consultant" />
      <div className="p-6">
        <ConsultantForm clients={clients} vendors={vendors} />
      </div>
    </>
  );
}
