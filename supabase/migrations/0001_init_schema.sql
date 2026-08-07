-- =====================================================================
-- IT STAFFING SaaS — Core Schema (Phase 1)
-- Consultant -> Timesheet -> Client Invoice -> Vendor Invoice -> Payroll -> P&L
-- Target: Supabase (Postgres 15+)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type billing_cycle as enum ('WEEKLY', 'BIWEEKLY', 'MONTHLY');
create type payment_terms as enum ('NET_15', 'NET_30', 'NET_45');
create type employment_type as enum ('W2', 'C2C', '1099');
create type timesheet_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type invoice_status as enum ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
create type vendor_invoice_status as enum ('PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'CANCELLED');
create type payroll_status as enum ('PENDING', 'PROCESSED', 'PAID');
create type app_role as enum ('ADMIN', 'ACCOUNT_MANAGER', 'RECRUITER', 'FINANCE', 'CONSULTANT', 'CLIENT_APPROVER');

-- ---------------------------------------------------------------------
-- ORG / USERS (Supabase auth.users is the source of truth for login)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role app_role not null default 'RECRUITER',
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- MODULE 1: CLIENTS
-- ---------------------------------------------------------------------
create table clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text not null,
  billing_contact text,
  email text,
  currency text not null default 'USD',
  billing_cycle billing_cycle not null default 'MONTHLY',
  payment_terms payment_terms not null default 'NET_30',
  purchase_order text,
  account_manager_id uuid references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_name text not null,
  description text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- MODULE 2: VENDORS (for C2C consultants)
-- ---------------------------------------------------------------------
create table vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  company text,
  email text,
  phone text,
  payment_terms payment_terms not null default 'NET_30',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- MODULE 2: CONSULTANTS
-- ---------------------------------------------------------------------
create table consultants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id), -- if the consultant logs in to submit timesheets
  consultant_name text not null,
  employee_id text unique,
  vendor_id uuid references vendors(id), -- required if employment_type = C2C
  employment_type employment_type not null,
  client_id uuid references clients(id),
  project_id uuid references projects(id),
  start_date date not null,
  end_date date,
  bill_rate numeric(12,2) not null default 0,      -- client rate
  pay_rate numeric(12,2) not null default 0,        -- consultant/payroll rate
  vendor_rate numeric(12,2) not null default 0,      -- what vendor is paid (C2C)
  overtime_rate numeric(12,2) not null default 0,
  currency text not null default 'USD',
  recruiter_id uuid references profiles(id),
  account_manager_id uuid references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_c2c_vendor check (
    employment_type <> 'C2C' or vendor_id is not null
  )
);

create index idx_consultants_client on consultants(client_id);
create index idx_consultants_vendor on consultants(vendor_id);

-- ---------------------------------------------------------------------
-- MODULE 3: TIMESHEETS
-- ---------------------------------------------------------------------
create table timesheets (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  client_id uuid not null references clients(id),
  project_id uuid references projects(id),
  week_start date not null,
  week_end date not null,
  regular_hours numeric(6,2) not null default 0,
  ot_hours numeric(6,2) not null default 0,
  holiday_hours numeric(6,2) not null default 0,
  pto_hours numeric(6,2) not null default 0,
  total_hours numeric(6,2) generated always as
    (regular_hours + ot_hours + holiday_hours + pto_hours) stored,
  status timesheet_status not null default 'PENDING',
  approved_by_client text,
  approved_at timestamptz,
  attachment_url text,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (consultant_id, week_start, week_end)
);

create index idx_timesheets_status on timesheets(status);
create index idx_timesheets_consultant on timesheets(consultant_id);

-- ---------------------------------------------------------------------
-- MODULE 4: CLIENT INVOICES
-- ---------------------------------------------------------------------
create table client_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  invoice_date date not null default current_date,
  due_date date not null,
  client_id uuid not null references clients(id),
  consultant_id uuid not null references consultants(id),
  project_id uuid references projects(id),
  timesheet_id uuid references timesheets(id),
  hours_worked numeric(6,2) not null default 0,
  bill_rate numeric(12,2) not null default 0,
  regular_amount numeric(14,2) not null default 0,
  ot_amount numeric(14,2) not null default 0,
  taxes numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  grand_total numeric(14,2) generated always as
    (regular_amount + ot_amount + taxes - discount) stored,
  po_number text,
  pdf_url text,
  status invoice_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_client_invoices_status on client_invoices(status);
create index idx_client_invoices_client on client_invoices(client_id);

-- ---------------------------------------------------------------------
-- MODULE 5: VENDOR INVOICES (auto-created for C2C)
-- ---------------------------------------------------------------------
create table vendor_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  vendor_id uuid not null references vendors(id),
  consultant_id uuid not null references consultants(id),
  timesheet_id uuid references timesheets(id),
  hours numeric(6,2) not null default 0,
  vendor_rate numeric(12,2) not null default 0,
  amount numeric(14,2) generated always as (hours * vendor_rate) stored,
  invoice_date date not null default current_date,
  due_date date not null,
  status vendor_invoice_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vendor_invoices_status on vendor_invoices(status);

-- ---------------------------------------------------------------------
-- MODULE 6: PAYROLL (auto-created for W2)
-- ---------------------------------------------------------------------
create table payroll (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id),
  timesheet_id uuid references timesheets(id),
  pay_period_start date not null,
  pay_period_end date not null,
  hours numeric(6,2) not null default 0,
  pay_rate numeric(12,2) not null default 0,
  gross_pay numeric(14,2) generated always as (hours * pay_rate) stored,
  taxes numeric(14,2) not null default 0,
  benefits numeric(14,2) not null default 0,
  net_pay numeric(14,2) generated always as
    (hours * pay_rate - taxes - benefits) stored,
  payslip_url text,
  status payroll_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payroll_status on payroll(status);

-- ---------------------------------------------------------------------
-- MODULE 7: OTHER EXPENSES (feeds P&L)
-- ---------------------------------------------------------------------
create table other_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text,
  amount numeric(14,2) not null,
  expense_date date not null default current_date,
  client_id uuid references clients(id), -- optional: attribute to a client
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (for automation step 8: email notifications)
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  subject text not null,
  body text not null,
  related_table text,
  related_id uuid,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- AUTOMATION: Timesheet approval -> Invoice / Vendor Invoice / Payroll
-- =====================================================================
create sequence if not exists invoice_seq start 1;
create sequence if not exists vendor_invoice_seq start 1;

create or replace function fn_generate_invoice_number(prefix text, seq_name text)
returns text language plpgsql as $$
declare
  next_val bigint;
begin
  execute format('select nextval(%L)', seq_name) into next_val;
  return prefix || to_char(current_date, 'YYYYMM') || '-' || lpad(next_val::text, 5, '0');
end;
$$;

create or replace function fn_on_timesheet_approved()
returns trigger language plpgsql as $$
declare
  c consultants%rowtype;
  cl clients%rowtype;
  due date;
  reg_amt numeric(14,2);
  ot_amt numeric(14,2);
  new_invoice_id uuid;
begin
  if NEW.status = 'APPROVED' and (OLD.status is distinct from 'APPROVED') then

    select * into c from consultants where id = NEW.consultant_id;
    select * into cl from clients where id = NEW.client_id;

    due := case cl.payment_terms
      when 'NET_15' then current_date + 15
      when 'NET_30' then current_date + 30
      when 'NET_45' then current_date + 45
    end;

    reg_amt := NEW.regular_hours * c.bill_rate;
    ot_amt := NEW.ot_hours * c.overtime_rate;

    -- 4. Client Invoice
    insert into client_invoices (
      invoice_number, due_date, client_id, consultant_id, project_id,
      timesheet_id, hours_worked, bill_rate, regular_amount, ot_amount, status
    ) values (
      fn_generate_invoice_number('INV', 'invoice_seq'), due, NEW.client_id, NEW.consultant_id,
      NEW.project_id, NEW.id, NEW.total_hours, c.bill_rate, reg_amt, ot_amt, 'DRAFT'
    ) returning id into new_invoice_id;

    -- 4b. C2C -> Vendor Invoice
    if c.employment_type = 'C2C' then
      insert into vendor_invoices (
        invoice_number, vendor_id, consultant_id, timesheet_id, hours, vendor_rate, due_date, status
      ) values (
        fn_generate_invoice_number('VEN', 'vendor_invoice_seq'), c.vendor_id, c.id, NEW.id,
        NEW.total_hours, c.vendor_rate, due, 'PENDING'
      );
    end if;

    -- 4c. W2 -> Payroll
    if c.employment_type = 'W2' then
      insert into payroll (
        consultant_id, timesheet_id, pay_period_start, pay_period_end, hours, pay_rate, status
      ) values (
        c.id, NEW.id, NEW.week_start, NEW.week_end, NEW.total_hours, c.pay_rate, 'PENDING'
      );
    end if;

    -- 8. Notification stub
    insert into notifications (recipient_email, subject, body, related_table, related_id)
    values (cl.email, 'Invoice generated', 'A new invoice was generated for approved timesheet ' || NEW.id, 'client_invoices', new_invoice_id);

  end if;
  return NEW;
end;
$$;

create trigger trg_timesheet_approved
after update on timesheets
for each row execute function fn_on_timesheet_approved();

-- =====================================================================
-- P&L VIEW (Module 7 — computed on the fly, no stored duplication)
-- =====================================================================
create or replace view v_profit_loss as
with per_invoice as (
  select
    ci.client_id,
    date_trunc('month', ci.invoice_date)::date as period,
    (ci.regular_amount + ci.ot_amount) as revenue,
    coalesce((select sum(vi.amount) from vendor_invoices vi
              where vi.timesheet_id = ci.timesheet_id), 0) as vendor_cost,
    coalesce((select sum(p.gross_pay) from payroll p
              where p.timesheet_id = ci.timesheet_id), 0) as payroll_cost
  from client_invoices ci
)
select
  client_id,
  period,
  sum(revenue) as client_revenue,
  sum(vendor_cost) as vendor_cost,
  sum(payroll_cost) as payroll_cost,
  coalesce((select sum(oe.amount) from other_expenses oe
            where oe.client_id = per_invoice.client_id
              and date_trunc('month', oe.expense_date) = per_invoice.period), 0) as other_expenses
from per_invoice
group by client_id, period;
-- Note: gross_profit / net_profit / margin_% are derived in the application layer
-- (or a second view) as:
--   gross_profit = client_revenue - vendor_cost - payroll_cost
--   net_profit   = gross_profit - other_expenses
--   margin_pct   = net_profit / nullif(client_revenue,0) * 100

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function fn_set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_clients_updated before update on clients for each row execute function fn_set_updated_at();
create trigger trg_consultants_updated before update on consultants for each row execute function fn_set_updated_at();
create trigger trg_timesheets_updated before update on timesheets for each row execute function fn_set_updated_at();
create trigger trg_client_invoices_updated before update on client_invoices for each row execute function fn_set_updated_at();
create trigger trg_vendor_invoices_updated before update on vendor_invoices for each row execute function fn_set_updated_at();
create trigger trg_payroll_updated before update on payroll for each row execute function fn_set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY (baseline — refine per role in Phase 2)
-- =====================================================================
alter table clients enable row level security;
alter table consultants enable row level security;
alter table timesheets enable row level security;
alter table client_invoices enable row level security;
alter table vendor_invoices enable row level security;
alter table payroll enable row level security;

-- Authenticated staff (ADMIN/FINANCE/ACCOUNT_MANAGER/RECRUITER) can read everything.
-- Consultants can only see/submit their own timesheets. Policies below are a starting
-- point — expand per-table as the UI for each role is built.
create policy "staff_full_read_clients" on clients for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('ADMIN','FINANCE','ACCOUNT_MANAGER','RECRUITER')));

create policy "consultant_own_timesheets" on timesheets for all
  using (
    exists (select 1 from consultants c where c.id = timesheets.consultant_id and c.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('ADMIN','FINANCE','ACCOUNT_MANAGER'))
  );
