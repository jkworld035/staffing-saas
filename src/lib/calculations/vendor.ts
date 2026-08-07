import { round2 } from "./invoice";

export function calculateVendorAmount(hours: number, vendorRate: number): number {
  return round2(hours * vendorRate);
}
