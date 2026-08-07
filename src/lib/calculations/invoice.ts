// Mirrors the generated columns in client_invoices (0001_init_schema.sql)
// so previews in the UI match exactly what the DB will compute.

export interface InvoiceInput {
  regularHours: number;
  otHours: number;
  billRate: number;
  overtimeRate: number;
  taxes?: number;
  discount?: number;
}

export interface InvoiceCalculation {
  regularAmount: number;
  otAmount: number;
  taxes: number;
  discount: number;
  grandTotal: number;
}

export function calculateClientInvoice(input: InvoiceInput): InvoiceCalculation {
  const regularAmount = round2(input.regularHours * input.billRate);
  const otAmount = round2(input.otHours * input.overtimeRate);
  const taxes = round2(input.taxes ?? 0);
  const discount = round2(input.discount ?? 0);
  const grandTotal = round2(regularAmount + otAmount + taxes - discount);

  return { regularAmount, otAmount, taxes, discount, grandTotal };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
