alter table vendor_invoices add column if not exists paid_date date;
alter table client_invoices add column if not exists paid_date date;
alter table payroll add column if not exists paid_date date;
