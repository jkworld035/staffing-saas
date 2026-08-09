"use client";

import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { createClientInvoiceRecord } from "@/app/(dashboard)/invoices/client/actions";
import { calculateClientInvoice, formatCurrency } from "@/lib/calculations/invoice";
import { useMemo, useState } from "react";

interface ClientOption {
  id: string;
  label: string;
  paymentTerms: string;
}

interface ConsultantOption {
  id: string;
  label: string;
  clientId: string;
  billRate: number;
}

const TERMS_DAYS: Record<string, number> = { NET_15: 15, NET_30: 30, NET_45: 45 };

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ClientInvoiceForm({
  clients,
  consultants,
  suggestedInvoiceNumber,
}: {
  clients: ClientOption[];
  consultants: ConsultantOption[];
  suggestedInvoiceNumber: string;
}) {
  const [clientId, setClientId] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState("");
  const [hours, setHours] = useState(0);
  const [billRate, setBillRate] = useState(0);
  const [otAmount, setOtAmount] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [discount, setDiscount] = useState(0);

  const filteredConsultants = useMemo(
    () => (clientId ? consultants.filter((c) => c.clientId === clientId) : consultants),
    [clientId, consultants]
  );

  function handleClientChange(id: string) {
    setClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      const days = TERMS_DAYS[client.paymentTerms] ?? 30;
      setDueDate(addDays(invoiceDate, days));
    }
    const stillValid = consultants.find((c) => c.id === consultantId && c.clientId === id);
    if (!stillValid) setConsultantId("");
  }

  function handleConsultantChange(id: string) {
    setConsultantId(id);
    const match = consultants.find((c) => c.id === id);
    if (match) setBillRate(match.billRate);
  }

  const calc = calculateClientInvoice({
    regularHours: hours,
    otHours: 0,
    billRate,
    overtimeRate: 0,
    taxes,
    discount,
  });
  const grandTotal = calc.regularAmount + otAmount + calc.taxes - calc.discount;

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <form action={createClientInvoiceRecord} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client" htmlFor="client_id">
              <Select id="client_id" name="client_id" required value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Consultant" htmlFor="consultant_id">
              <Select id="consultant_id" name="consultant_id" required value={consultantId} onChange={(e) => handleConsultantChange(e.target.value)}>
                <option value="">Select a consultant...</option>
                {filteredConsultants.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Invoice number" htmlFor="invoice_number">
              <Input id="invoice_number" name="invoice_number" required defaultValue={suggestedInvoiceNumber} />
            </Field>
            <Field label="PO number" htmlFor="po_number">
              <Input id="po_number" name="po_number" placeholder="Optional" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Invoice date" htmlFor="invoice_date">
              <Input
                id="invoice_date" name="invoice_date" type="date" required value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </Field>
            <Field label="Due date" htmlFor="due_date">
              <Input
                id="due_date" name="due_date" type="date" required value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md border border-line bg-canvas p-4">
            <Field label="Hours" htmlFor="hours_worked">
              <Input
                id="hours_worked" name="hours_worked" type="number" step="0.25" required value={hours || ""}
                onChange={(e) => setHours(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Bill rate" htmlFor="bill_rate">
              <Input
                id="bill_rate" name="bill_rate" type="number" step="0.01" required value={billRate || ""}
                onChange={(e) => setBillRate(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Overtime amount" htmlFor="ot_amount">
              <Input
                id="ot_amount" name="ot_amount" type="number" step="0.01" value={otAmount || ""}
                onChange={(e) => setOtAmount(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue="DRAFT">
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Taxes" htmlFor="taxes">
              <Input
                id="taxes" name="taxes" type="number" step="0.01" value={taxes || ""}
                onChange={(e) => setTaxes(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Discount" htmlFor="discount">
              <Input
                id="discount" name="discount" type="number" step="0.01" value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          <div className="space-y-1 rounded-md bg-brand-50 px-4 py-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="tabular">{formatCurrency(calc.regularAmount + otAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-700">Total</span>
              <span className="tabular text-lg font-semibold text-brand-700">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Button variant="secondary" href="/invoices/client">Cancel</Button>
            <Button type="submit">Save invoice</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
