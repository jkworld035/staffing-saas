import { round2 } from "./invoice";

export interface PayrollInput {
  hours: number;
  payRate: number;
  taxes?: number;
  benefits?: number;
}

export interface PayrollCalculation {
  grossPay: number;
  taxes: number;
  benefits: number;
  netPay: number;
}

export function calculatePayroll(input: PayrollInput): PayrollCalculation {
  const grossPay = round2(input.hours * input.payRate);
  const taxes = round2(input.taxes ?? 0);
  const benefits = round2(input.benefits ?? 0);
  const netPay = round2(grossPay - taxes - benefits);
  return { grossPay, taxes, benefits, netPay };
}
