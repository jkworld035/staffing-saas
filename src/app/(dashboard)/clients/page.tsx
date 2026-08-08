import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/types/database.types";

async function getClients(): Promise<Client[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("clients").select("*").order("client_name");
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: Column<Client>[] = [
  { header: "Client", accessor: (c) => (
      <div>
        <p className="font-medium">{c.client_name}</p>
        <p className="text-xs text-slate-400">{c.company}</p>
      </div>
    ) },
  { header: "Billing contact", accessor: (c) => c.billing_contact ?? "--" },
  { header: "Cycle", accessor: (c) => <Badge>{c.billing_cycle}</Badge> },
  { header: "Terms", accessor: (c) => c.payment_terms.replace("_", " ") },
  { header: "PO #", accessor: (c) => c.purchase_order ?? "--" },
  { header: "Status", accessor: (c) => <Badge tone={c.is_active ? "signal" : "neutral"}>{c.is_active ? "Active" : "Inactive"}</Badge> },
  { header: "", accessor: (c) => (
      <a href={`/clients/${c.id}/edit`} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
        <Pencil size={12} /> Edit
      </a>
    ), align: "right" },
];

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <Topbar
        title="Clients"
        action={
          <Button href="/clients/new" variant="primary">
            <Plus size={15} /> New client
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <DataTable
            columns={columns}
            rows={clients}
            keyFor={(c) => c.id}
            emptyTitle="No clients yet"
            emptyHint="Add your first client to start staffing consultants against them."
          />
        </Card>
      </div>
    </>
  );
}
