// Hand-authored to match supabase/migrations/0001_init_schema.sql.
// Once the Supabase project is linked, replace this file by running:
//   npm run gen:types

export type EmploymentType = "W2" | "C2C" | "1099";
export type TimesheetStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
export type VendorInvoiceStatus = "PENDING" | "APPROVED" | "PAID" | "OVERDUE" | "CANCELLED";
export type PayrollStatus = "PENDING" | "PROCESSED" | "PAID";
export type BillingCycle = "WEEKLY" | "BIWEEKLY" | "MONTHLY";
export type PaymentTerms = "NET_15" | "NET_30" | "NET_45";
export type AppRole = "ADMIN" | "ACCOUNT_MANAGER" | "RECRUITER" | "FINANCE" | "CONSULTANT" | "CLIENT_APPROVER";

export interface Client {
  id: string;
  client_name: string;
  company: string;
  billing_contact: string | null;
  email: string | null;
  currency: string;
  billing_cycle: BillingCycle;
  payment_terms: PaymentTerms;
  purchase_order: string | null;
  account_manager_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Consultant {
  id: string;
  consultant_name: string;
  employee_id: string | null;
  vendor_id: string | null;
  employment_type: EmploymentType;
  client_id: string | null;
  project_id: string | null;
  start_date: string;
  end_date: string | null;
  bill_rate: number;
  pay_rate: number;
  vendor_rate: number;
  overtime_rate: number;
  currency: string;
  recruiter_id: string | null;
  account_manager_id: string | null;
  is_active: boolean;
}

export interface Timesheet {
  id: string;
  consultant_id: string;
  client_id: string;
  project_id: string | null;
  week_start: string;
  week_end: string;
  regular_hours: number;
  ot_hours: number;
  holiday_hours: number;
  pto_hours: number;
  total_hours: number;
  status: TimesheetStatus;
  approved_by_client: string | null;
  attachment_url: string | null;
  comments: string | null;
}

export interface ClientInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  paid_date: string | null;
  client_id: string;
  consultant_id: string;
  hours_worked: number;
  bill_rate: number;
  regular_amount: number;
  ot_amount: number;
  taxes: number;
  discount: number;
  grand_total: number;
  po_number: string | null;
  pdf_url: string | null;
  status: InvoiceStatus;
}

export interface VendorInvoice {
  id: string;
  invoice_number: string;
  vendor_id: string;
  consultant_id: string;
  hours: number;
  vendor_rate: number;
  amount: number;
  invoice_date: string;
  due_date: string;
  paid_date: string | null;
  status: VendorInvoiceStatus;
}

export interface Payroll {
  id: string;
  consultant_id: string;
  pay_period_start: string;
  pay_period_end: string;
  hours: number;
  pay_rate: number;
  gross_pay: number;
  taxes: number;
  benefits: number;
  net_pay: number;
  payslip_url: string | null;
  status: PayrollStatus;
}

// Minimal Database generic so `createBrowserClient<Database>` / `createServerClient<Database>`
// type-check. Expand per-table Row/Insert/Update shapes as each module's forms are built,
// or swap this whole file for the Supabase CLI codegen output.
export interface Database {
  public: {
    Tables: {
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client>; Relationships: [] };
      consultants: { Row: Consultant; Insert: Partial<Consultant>; Update: Partial<Consultant>; Relationships: [] };
      timesheets: { Row: Timesheet; Insert: Partial<Timesheet>; Update: Partial<Timesheet>; Relationships: [] };
      client_invoices: { Row: ClientInvoice; Insert: Partial<ClientInvoice>; Update: Partial<ClientInvoice>; Relationships: [] };
      vendor_invoices: { Row: VendorInvoice; Insert: Partial<VendorInvoice>; Update: Partial<VendorInvoice>; Relationships: [] };
      payroll: { Row: Payroll; Insert: Partial<Payroll>; Update: Partial<Payroll>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
