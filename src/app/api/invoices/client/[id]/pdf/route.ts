import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClientInvoiceDocument, type InvoicePdfData } from "@/lib/pdf/ClientInvoiceDocument";
import React from "react";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("client_invoices")
    .select("*, clients(client_name, company, billing_contact, email, currency), consultants(consultant_name)")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const client = invoice.clients as unknown as {
    client_name: string; company: string; billing_contact: string | null; email: string | null; currency: string;
  } | null;
  const consultant = invoice.consultants as unknown as { consultant_name: string } | null;

  const pdfData: InvoicePdfData = {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    status: invoice.status,
    poNumber: invoice.po_number,
    clientName: client?.client_name ?? "Unknown client",
    clientCompany: client?.company ?? "",
    billingContact: client?.billing_contact ?? null,
    billingEmail: client?.email ?? null,
    consultantName: consultant?.consultant_name ?? "Unknown consultant",
    hoursWorked: Number(invoice.hours_worked),
    billRate: Number(invoice.bill_rate),
    regularAmount: Number(invoice.regular_amount),
    otAmount: Number(invoice.ot_amount),
    taxes: Number(invoice.taxes),
    discount: Number(invoice.discount),
    grandTotal: Number(invoice.grand_total),
    currency: client?.currency ?? "USD",
  };

  const element = React.createElement(ClientInvoiceDocument, { data: pdfData });
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
