import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClientInvoiceDocument, type InvoicePdfData } from "@/lib/pdf/ClientInvoiceDocument";
import React from "react";

const TERMS_LABEL: Record<string, string> = {
  NET_15: "Net 15",
  NET_30: "Net 30",
  NET_45: "Net 45",
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from("client_invoices")
    .select("*, clients(client_name, company, billing_contact, email, currency, payment_terms), consultants(consultant_name)")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const client = invoice.clients as unknown as {
    client_name: string; company: string; billing_contact: string | null; email: string | null;
    currency: string; payment_terms: string;
  } | null;
  const consultant = invoice.consultants as unknown as { consultant_name: string } | null;

  const periodLabel = "For the month of " + new Date(invoice.invoice_date).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const pdfData: InvoicePdfData = {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    paymentTerms: TERMS_LABEL[client?.payment_terms ?? ""] ?? "Net 30",
    status: invoice.status,
    poNumber: invoice.po_number,
    clientName: client?.client_name ?? "Unknown client",
    clientCompany: client?.company ?? "",
    billingContact: client?.billing_contact ?? null,
    billingEmail: client?.email ?? null,
    consultantName: consultant?.consultant_name ?? "Unknown consultant",
    periodLabel,
    hoursWorked: Number(invoice.hours_worked),
    billRate: Number(invoice.bill_rate),
    regularAmount: Number(invoice.regular_amount),
    otAmount: Number(invoice.ot_amount),
    taxes: Number(invoice.taxes),
    discount: Number(invoice.discount),
    grandTotal: Number(invoice.grand_total),
    currency: client?.currency ?? "USD",
    bankRouting: process.env.INVOICE_BANK_ROUTING,
    bankAccount: process.env.INVOICE_BANK_ACCOUNT,
    paymentLink: process.env.INVOICE_PAYMENT_LINK,
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
