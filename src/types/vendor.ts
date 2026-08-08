export interface Vendor {
  id: string;
  vendor_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  payment_terms: "NET_15" | "NET_30" | "NET_45";
  is_active: boolean;
  created_at: string;
}
