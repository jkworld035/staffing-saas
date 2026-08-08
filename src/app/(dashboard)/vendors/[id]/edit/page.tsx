import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { updateVendorRecord } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: vendor } = await supabase.from("vendors").select("*").eq("id", id).single();

  if (!vendor) notFound();

  const updateWithId = updateVendorRecord.bind(null, id);

  return (
    <>
      <Topbar title={`Edit ${vendor.vendor_name}`} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form action={updateWithId} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vendor name" htmlFor="vendor_name">
                  <Input id="vendor_name" name="vendor_name" required defaultValue={vendor.vendor_name} />
                </Field>
                <Field label="Company / legal entity" htmlFor="company">
                  <Input id="company" name="company" defaultValue={vendor.company ?? ""} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" htmlFor="email">
                  <Input id="email" name="email" type="email" defaultValue={vendor.email ?? ""} />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" name="phone" defaultValue={vendor.phone ?? ""} />
                </Field>
              </div>

              <Field label="Payment terms" htmlFor="payment_terms">
                <Select id="payment_terms" name="payment_terms" defaultValue={vendor.payment_terms}>
                  <option value="NET_15">Net 15</option>
                  <option value="NET_30">Net 30</option>
                  <option value="NET_45">Net 45</option>
                </Select>
              </Field>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="is_active" defaultChecked={vendor.is_active} className="h-4 w-4 rounded border-line" />
                Active vendor
              </label>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="secondary" href="/vendors">Cancel</Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
