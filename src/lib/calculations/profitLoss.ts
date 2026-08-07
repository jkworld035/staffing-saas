import { round2 } from "./invoice";

export interface ProfitLossInput {
  clientRevenue: number;
  vendorCost: number;
  payrollCost: number;
  otherExpenses?: number;
}

export interface ProfitLossResult {
  grossProfit: number;
  netProfit: number;
  marginPct: number;
}

// Formula (matches MODULE 7 spec):
// Gross Profit = Revenue - Vendor Cost - Payroll Cost
// Net Profit   = Gross Profit - Other Expenses
// Margin %     = Net Profit / Revenue * 100
export function calculateProfitLoss(input: ProfitLossInput): ProfitLossResult {
  const otherExpenses = input.otherExpenses ?? 0;
  const grossProfit = round2(input.clientRevenue - input.vendorCost - input.payrollCost);
  const netProfit = round2(grossProfit - otherExpenses);
  const marginPct = input.clientRevenue > 0
    ? round2((netProfit / input.clientRevenue) * 100)
    : 0;

  return { grossProfit, netProfit, marginPct };
}
