"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createConsultantRecord } from "../actions";
import { useState } from "react";

export default function NewConsultantPage() {
  const [employmentType, setEmploymentType] = useState("W2");

  return (
    <>
      <Topbar title="New consultant" />
      <div className="p-6">
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
                <Field label="Vendor ID" htmlFor="vendor_id">
                  <Input id="vendor_id" name="vendor_id" placeholder="Paste vendor UUID (Vendors module)" />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Client ID" htmlFor="client_id">
                  <Input id="client_id" name="client_id" placeholder="Paste client UUID (from Clients page)" />
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
      </div>
    </>
  );
}
