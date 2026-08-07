-- Idempotent version: drops each policy first in case it already exists
-- from a prior partial run, so this is safe to run more than once.

create or replace function fn_is_staff()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

drop policy if exists "staff_full_read_clients" on clients;
drop policy if exists "staff_all_clients" on clients;
create policy "staff_all_clients" on clients for all
  using (fn_is_staff()) with check (fn_is_staff());

alter table consultants enable row level security;
drop policy if exists "staff_all_consultants" on consultants;
create policy "staff_all_consultants" on consultants for all
  using (fn_is_staff()) with check (fn_is_staff());

alter table vendors enable row level security;
drop policy if exists "staff_all_vendors" on vendors;
create policy "staff_all_vendors" on vendors for all
  using (fn_is_staff()) with check (fn_is_staff());

alter table projects enable row level security;
drop policy if exists "staff_all_projects" on projects;
create policy "staff_all_projects" on projects for all
  using (fn_is_staff()) with check (fn_is_staff());

drop policy if exists "staff_all_client_invoices" on client_invoices;
create policy "staff_all_client_invoices" on client_invoices for all
  using (fn_is_staff()) with check (fn_is_staff());

drop policy if exists "staff_all_vendor_invoices" on vendor_invoices;
create policy "staff_all_vendor_invoices" on vendor_invoices for all
  using (fn_is_staff()) with check (fn_is_staff());

drop policy if exists "staff_all_payroll" on payroll;
create policy "staff_all_payroll" on payroll for all
  using (fn_is_staff()) with check (fn_is_staff());

alter table other_expenses enable row level security;
drop policy if exists "staff_all_other_expenses" on other_expenses;
create policy "staff_all_other_expenses" on other_expenses for all
  using (fn_is_staff()) with check (fn_is_staff());

alter table notifications enable row level security;
drop policy if exists "staff_all_notifications" on notifications;
create policy "staff_all_notifications" on notifications for all
  using (fn_is_staff()) with check (fn_is_staff());

drop policy if exists "consultant_own_timesheets" on timesheets;
drop policy if exists "staff_or_own_timesheets" on timesheets;
create policy "staff_or_own_timesheets" on timesheets for all
  using (
    fn_is_staff()
    or exists (select 1 from consultants c where c.id = timesheets.consultant_id and c.user_id = auth.uid())
  )
  with check (
    fn_is_staff()
    or exists (select 1 from consultants c where c.id = timesheets.consultant_id and c.user_id = auth.uid())
  );

alter table profiles enable row level security;
drop policy if exists "read_own_profile" on profiles;
create policy "read_own_profile" on profiles for select
  using (id = auth.uid());
