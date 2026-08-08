"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createConsultantRecord } from "@/app/(dashboard)/consultants/actions";
import { useState } from "react";
import Link from "next/link";

interface Option {
  id: string;
  label: string;
}

export function ConsultantForm({ clients, vendors }: { clients: Option[]; vendors: Option[] }) {
  const [employmentType, setEmploymentType] = useState("W2");

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <form action={createConsultantRecord} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Consultant name" htmlFor="consultant_name">
              <Input id="consultant_name" name="consultant_name" required placeholder="Rahul Mehta" />
            </Field>
            <Field label="Employee ID" htmlFor="employee_id">
              <Input id="employee_id" name="employee_id" placeholder="EMP-1042" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Employment type" htmlFor="employment_type">
              <Select
                id="employment_type"
                name="employment_type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="W2">W2</option>
                <option value="C2C">C2C</option>
                <option value="1099">1099</option>
              </Select>
            </Field>
            <Field label="Start date" htmlFor="start_date">
              <Input id="start_date" name="start_date" type="date" required />
            </Field>
          </div>

          {employmentType === "C2C" && (
            <Field label="Vendor" htmlFor="vendor_id">
              {vendors.length === 0 ? (
                <p className="rounded-md border border-dashed border-line px-3 py-2 text-sm text-slate-400">
                  No vendors yet --{" "}
                  <Link href="/vendors/new" className="text-brand-600 underline">
                    add one first
                  </Link>
                  , then come back.
                </p>
              ) : (
                <Select id="vendor_id" name="vendor_id" required>
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
              {clients.length === 0 ? (
                <p className="rounded-md border border-dashed border-line px-3 py-2 text-sm text-slate-400">
                  No clients yet --{" "}
                  <Link href="/clients/new" className="text-brand-600 underline">
                    add one first
                  </Link>
                  .
                </p>
              ) : (
                <Select id="client_id" name="client_id" required>
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select id="currency" name="currency" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md border border-line bg-canvas p-4">
            <Field label="Bill rate (client pays)" htmlFor="bill_rate">
              <Input id="bill_rate" name="bill_rate" type="number" step="0.01" required placeholder="85.00" />
            </Field>
            <Field label="Overtime rate" htmlFor="overtime_rate">
              <Input id="overtime_rate" name="overtime_rate" type="number" step="0.01" placeholder="127.50" />
            </Field>
            {employmentType === "C2C" ? (
              <Field label="Vendor rate (paid to vendor)" htmlFor="vendor_rate">
                <Input id="vendor_rate" name="vendor_rate" type="number" step="0.01" placeholder="65.00" />
              </Field>
            ) : (
              <Field label="Pay rate (payroll)" htmlFor="pay_rate">
                <Input id="pay_rate" name="pay_rate" type="number" step="0.01" placeholder="60.00" />
              </Field>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Button variant="secondary" href="/consultants">Cancel</Button>
            <Button type="submit">Save consultant</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
