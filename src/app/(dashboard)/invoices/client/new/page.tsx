import { Topbar } from "@/components/layout/Topbar";
import { ClientInvoiceForm } from "@/components/invoices/ClientInvoiceForm";
import { createClient } from "@/lib/supabase/server";

async function getOptions() {
  try {
    const supabase = await createClient();
    const [clientsRes, consultantsRes] = await Promise.all([
      supabase.from("clients").select("id, client_name, payment_terms").eq("is_active", true).order("client_name"),
      supabase.from("consultants").select("id, consultant_name, client_id, bill_rate").eq("is_active", true).order("consultant_name"),
    ]);

    const clients = (clientsRes.data ?? []).map((c) => ({
      id: c.id,
      label: c.client_name,
      paymentTerms: c.payment_terms,
    }));
    const consultants = (consultantsRes.data ?? []).map((c) => ({
      id: c.id,
      label: c.consultant_name,
      clientId: c.client_id ?? "",
      billRate: Number(c.bill_rate),
    }));

    return { clients, consultants };
  } catch {
    return { clients: [], consultants: [] };
  }
}

function suggestInvoiceNumber(): string {
  const now = new Date();
  const stamp = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return "INV" + stamp + "-M" + random;
}

export default async function NewClientInvoicePage() {
  const { clients, consultants } = await getOptions();

  return (
    <>
      <Topbar title="New invoice" />
      <div className="p-6">
        <ClientInvoiceForm
          clients={clients}
          consultants={consultants}
          suggestedInvoiceNumber={suggestInvoiceNumber()}
        />
      </div>
    </>
  );
}
