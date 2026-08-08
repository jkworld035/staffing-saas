"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { updateConsultantRecord } from "@/app/(dashboard)/consultants/actions";
import { useState } from "react";
import Link from "next/link";
import type { Consultant } from "@/types/database.types";

interface Option {
  id: string;
  label: string;
}

export function EditConsultantForm({
  consultant,
  clients,
  vendors,
}: {
  consultant: Consultant;
  clients: Option[];
  vendors: Option[];
}) {
  const [employmentType, setEmploymentType] = useState(consultant.employment_type);
  const updateWithId = updateConsultantRecord.bind(null, consultant.id);

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <form action={updateWithId} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Consultant name" htmlFor="consultant_name">
              <Input id="consultant_name" name="consultant_name" required defaultValue={consultant.consultant_name} />
            </Field>
            <Field label="Employee ID" htmlFor="employee_id">
              <Input id="employee_id" name="employee_id" defaultValue={consultant.employee_id ?? ""} />
            </Field>
          </div>

          <Field label="Employment type" htmlFor="employment_type">
            <Select
              id="employment_type"
              name="employment_type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}
            >
              <option value="W2">W2</option>
              <option value="C2C">C2C</option>
              <option value="1099">1099</option>
            </Select>
          </Field>

          {employmentType === "C2C" && (
            <Field label="Vendor" htmlFor="vendor_id">
              {vendors.length === 0 ? (
                <p className="rounded-md border border-dashed border-line px-3 py-2 text-sm text-slate-400">
                  No vendors yet --{" "}
                  <Link href="/vendors/new" className="text-brand-600 underline">
                    add one first
                  </Link>
                  .
                </p>
              ) : (
                <Select id="vendor_id" name="vendor_id" required defaultValue={consultant.vendor_id ?? ""}>
                  <option value="">Select a vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </Select>
              )}
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Client" htmlFor="client_id">
              <Select id="client_id" name="client_id" required defaultValue={consultant.client_id ?? ""}>
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select id="currency" name="currency" defaultValue={consultant.currency}>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md border border-line bg-canvas p-4">
            <Field label="Bill rate (client pays)" htmlFor="bill_rate">
              <Input id="bill_rate" name="bill_rate" type="number" step="0.01" required defaultValue={consultant.bill_rate} />
            </Field>
            <Field label="Overtime rate" htmlFor="overtime_rate">
              <Input id="overtime_rate" name="overtime_rate" type="number" step="0.01" defaultValue={consultant.overtime_rate} />
            </Field>
            {employmentType === "C2C" ? (
              <Field label="Vendor rate (paid to vendor)" htmlFor="vendor_rate">
                <Input id="vendor_rate" name="vendor_rate" type="number" step="0.01" defaultValue={consultant.vendor_rate} />
              </Field>
            ) : (
              <Field label="Pay rate (payroll)" htmlFor="pay_rate">
                <Input id="pay_rate" name="pay_rate" type="number" step="0.01" defaultValue={consultant.pay_rate} />
              </Field>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="is_active" defaultChecked={consultant.is_active} className="h-4 w-4 rounded border-line" />
            Active consultant
          </label>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Button variant="secondary" href="/consultants">Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
