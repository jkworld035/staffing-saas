import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { updateClientRecord } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();

  if (!client) notFound();

  const updateWithId = updateClientRecord.bind(null, id);

  return (
    <>
      <Topbar title={`Edit ${client.client_name}`} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form action={updateWithId} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client name" htmlFor="client_name">
                  <Input id="client_name" name="client_name" required defaultValue={client.client_name} />
                </Field>
                <Field label="Company / legal entity" htmlFor="company">
                  <Input id="company" name="company" required defaultValue={client.company} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Billing contact" htmlFor="billing_contact">
                  <Input id="billing_contact" name="billing_contact" defaultValue={client.billing_contact ?? ""} />
                </Field>
                <Field label="Billing email" htmlFor="email">
                  <Input id="email" name="email" type="email" defaultValue={client.email ?? ""} />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Currency" htmlFor="currency">
                  <Select id="currency" name="currency" defaultValue={client.currency}>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </Field>
                <Field label="Billing cycle" htmlFor="billing_cycle">
                  <Select id="billing_cycle" name="billing_cycle" defaultValue={client.billing_cycle}>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </Field>
                <Field label="Payment terms" htmlFor="payment_terms">
                  <Select id="payment_terms" name="payment_terms" defaultValue={client.payment_terms}>
                    <option value="NET_15">Net 15</option>
                    <option value="NET_30">Net 30</option>
                    <option value="NET_45">Net 45</option>
                  </Select>
                </Field>
              </div>

              <Field label="Purchase order (PO) number" htmlFor="purchase_order">
                <Input id="purchase_order" name="purchase_order" defaultValue={client.purchase_order ?? ""} />
              </Field>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="is_active" defaultChecked={client.is_active} className="h-4 w-4 rounded border-line" />
                Active client
              </label>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="secondary" href="/clients">Cancel</Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
