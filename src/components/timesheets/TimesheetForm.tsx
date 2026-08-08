"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { submitTimesheet } from "@/app/(dashboard)/timesheets/actions";
import { useMemo, useState } from "react";
import Link from "next/link";

interface ConsultantOption {
  id: string;
  label: string;
  clientId: string;
}

interface ClientOption {
  id: string;
  label: string;
}

export function TimesheetForm({ consultants, clients }: { consultants: ConsultantOption[]; clients: ClientOption[] }) {
  const [consultantId, setConsultantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [hours, setHours] = useState({ regular: 0, ot: 0, holiday: 0, pto: 0 });

  const total = useMemo(() => hours.regular + hours.ot + hours.holiday + hours.pto, [hours]);

  function handleConsultantChange(id: string) {
    setConsultantId(id);
    const match = consultants.find((c) => c.id === id);
    if (match?.clientId) setClientId(match.clientId);
  }

  if (consultants.length === 0) {
    return (
      <Card className="max-w-2xl">
        <CardBody>
          <p className="text-sm text-slate-400">
            No consultants yet --{" "}
            <Link href="/consultants/new" className="text-brand-600 underline">
              add one first
            </Link>
            , then submit a timesheet against them.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <form action={submitTimesheet} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Consultant" htmlFor="consultant_id">
              <Select
                id="consultant_id"
                name="consultant_id"
                required
                value={consultantId}
                onChange={(e) => handleConsultantChange(e.target.value)}
              >
                <option value="">Select a consultant...</option>
                {consultants.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Client" htmlFor="client_id">
              <Select
                id="client_id"
                name="client_id"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Week start" htmlFor="week_start">
              <Input id="week_start" name="week_start" type="date" required />
            </Field>
            <Field label="Week end" htmlFor="week_end">
              <Input id="week_end" name="week_end" type="date" required />
            </Field>
          </div>

          <div className="grid grid-cols-4 gap-3 rounded-md border border-line bg-canvas p-4">
            <Field label="Regular" htmlFor="regular_hours">
              <Input
                id="regular_hours" name="regular_hours" type="number" step="0.25" defaultValue={0}
                onChange={(e) => setHours((h) => ({ ...h, regular: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label="Overtime" htmlFor="ot_hours">
              <Input
                id="ot_hours" name="ot_hours" type="number" step="0.25" defaultValue={0}
                onChange={(e) => setHours((h) => ({ ...h, ot: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label="Holiday" htmlFor="holiday_hours">
              <Input
                id="holiday_hours" name="holiday_hours" type="number" step="0.25" defaultValue={0}
                onChange={(e) => setHours((h) => ({ ...h, holiday: Number(e.target.value) || 0 }))}
              />
            </Field>
            <Field label="PTO" htmlFor="pto_hours">
              <Input
                id="pto_hours" name="pto_hours" type="number" step="0.25" defaultValue={0}
                onChange={(e) => setHours((h) => ({ ...h, pto: Number(e.target.value) || 0 }))}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-md bg-brand-50 px-4 py-3">
            <span className="text-sm font-medium text-brand-700">Total hours this week</span>
            <span className="tabular text-lg font-semibold text-brand-700">{total.toFixed(2)}</span>
          </div>

          <Field label="Comments" htmlFor="comments">
            <Input id="comments" name="comments" placeholder="Optional note for the approver" />
          </Field>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Button variant="secondary" href="/timesheets">Cancel</Button>
            <Button type="submit">Submit for approval</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
