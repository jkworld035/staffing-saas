import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createClientRecord } from "../actions";

export default function NewClientPage() {
  return (
    <>
      <Topbar title="New client" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form action={createClientRecord} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client name" htmlFor="client_name">
                  <Input id="client_name" name="client_name" required placeholder="Acme Health Systems" />
                </Field>
                <Field label="Company / legal entity" htmlFor="company">
                  <Input id="company" name="company" required placeholder="Acme Health Systems LLC" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Billing contact" htmlFor="billing_contact">
                  <Input id="billing_contact" name="billing_contact" placeholder="Jane Cooper" />
                </Field>
                <Field label="Billing email" htmlFor="email">
                  <Input id="email" name="email" type="email" placeholder="ap@acmehealth.com" />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Currency" htmlFor="currency">
                  <Select id="currency" name="currency" defaultValue="USD">
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </Field>
                <Field label="Billing cycle" htmlFor="billing_cycle">
                  <Select id="billing_cycle" name="billing_cycle" defaultValue="MONTHLY">
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </Field>
                <Field label="Payment terms" htmlFor="payment_terms">
                  <Select id="payment_terms" name="payment_terms" defaultValue="NET_30">
                    <option value="NET_15">Net 15</option>
                    <option value="NET_30">Net 30</option>
                    <option value="NET_45">Net 45</option>
                  </Select>
                </Field>
              </div>

              <Field label="Purchase order (PO) number" htmlFor="purchase_order">
                <Input id="purchase_order" name="purchase_order" placeholder="PO-2026-0417" />
              </Field>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="secondary" href="/clients">Cancel</Button>
                <Button type="submit">Save client</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
