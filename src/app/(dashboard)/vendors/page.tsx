import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/types/vendor";

async function getVendors(): Promise<Vendor[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("vendors").select("*").order("vendor_name");
    return data ?? [];
  } catch {
    return [];
  }
}

const columns: Column<Vendor>[] = [
  { header: "Vendor", accessor: (v) => (
      <div>
        <p className="font-medium">{v.vendor_name}</p>
        <p className="text-xs text-slate-400">{v.company ?? "--"}</p>
      </div>
    ) },
  { header: "Email", accessor: (v) => v.email ?? "--" },
  { header: "Phone", accessor: (v) => v.phone ?? "--" },
  { header: "Terms", accessor: (v) => v.payment_terms.replace("_", " ") },
  { header: "Status", accessor: (v) => <Badge tone={v.is_active ? "signal" : "neutral"}>{v.is_active ? "Active" : "Inactive"}</Badge> },
];

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <>
      <Topbar
        title="Vendors"
        action={
          <Button href="/vendors/new">
            <Plus size={15} /> New vendor
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <DataTable
            columns={columns}
            rows={vendors}
            keyFor={(v) => v.id}
            emptyTitle="No vendors yet"
            emptyHint="Add a vendor before creating a C2C consultant -- they get linked at consultant setup."
          />
        </Card>
      </div>
    </>
  );
}
