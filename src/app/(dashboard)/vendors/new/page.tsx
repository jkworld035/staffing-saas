import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createVendorRecord } from "../actions";

export default function NewVendorPage() {
  return (
    <>
      <Topbar title="New vendor" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form action={createVendorRecord} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vendor name" htmlFor="vendor_name">
                  <Input id="vendor_name" name="vendor_name" required placeholder="Nova IT Staffing Inc." />
                </Field>
                <Field label="Company / legal entity" htmlFor="company">
                  <Input id="company" name="company" placeholder="Nova IT Staffing Inc." />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" htmlFor="email">
                  <Input id="email" name="email" type="email" placeholder="ap@novaitstaffing.com" />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" name="phone" placeholder="+1 (555) 010-2938" />
                </Field>
              </div>

              <Field label="Payment terms" htmlFor="payment_terms">
                <Select id="payment_terms" name="payment_terms" defaultValue="NET_30">
                  <option value="NET_15">Net 15</option>
                  <option value="NET_30">Net 30</option>
                  <option value="NET_45">Net 45</option>
                </Select>
              </Field>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <Button variant="secondary" href="/vendors">Cancel</Button>
                <Button type="submit">Save vendor</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
