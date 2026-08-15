-- SmartBiz ERP Lite — RLS alignment for the Admin / Cashier permission model.
-- Run this ONCE in the Supabase SQL editor of the existing smartbiz-erp-lite project.
-- It creates NO tables and renames nothing; it only replaces policies.

-- 1) Role helper (security definer so policies never recurse into profiles RLS)
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(p.role::text, '')) from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.current_app_role() = 'admin' $$;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- 2) Table grants (PostgREST needs these in addition to RLS)
grant select, insert, update, delete on public.categories, public.products,
  public.customers, public.sales, public.sale_items, public.inventory_logs,
  public.settings to authenticated;
grant select on public.profiles to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;

-- 3) Policies -------------------------------------------------------------
-- profiles: a user reads their own profile (role lookup); admins read all.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- categories: everyone signed in reads; admin writes.
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select to authenticated using (true);
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products: everyone signed in reads; admin writes catalog fields.
-- Cashier sale stock deduction uses public.deduct_stock_for_sale() (SECURITY DEFINER).
drop policy if exists products_select on public.products;
create policy products_select on public.products for select to authenticated using (true);
drop policy if exists products_insert on public.products;
create policy products_insert on public.products for insert to authenticated
  with check (public.is_admin());
drop policy if exists products_update on public.products;
create policy products_update on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists products_delete on public.products;
create policy products_delete on public.products for delete to authenticated
  using (public.is_admin());

-- customers: read + create + update for all signed-in users; delete admin only.
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated using (true);
drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers for insert to authenticated with check (true);
drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers for update to authenticated
  using (true) with check (true);
drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers for delete to authenticated
  using (public.is_admin());

-- sales / sale_items: read + create for all signed-in users; delete admin only.
drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales for select to authenticated using (true);
drop policy if exists sales_insert on public.sales;
create policy sales_insert on public.sales for insert to authenticated with check (true);
drop policy if exists sales_delete on public.sales;
create policy sales_delete on public.sales for delete to authenticated using (public.is_admin());

drop policy if exists sale_items_select on public.sale_items;
create policy sale_items_select on public.sale_items for select to authenticated using (true);
drop policy if exists sale_items_insert on public.sale_items;
create policy sale_items_insert on public.sale_items for insert to authenticated with check (true);
drop policy if exists sale_items_delete on public.sale_items;
create policy sale_items_delete on public.sale_items for delete to authenticated
  using (public.is_admin());

-- inventory_logs: read for all; insert for all (written by sales); edit/delete admin only.
drop policy if exists inventory_logs_select on public.inventory_logs;
create policy inventory_logs_select on public.inventory_logs for select to authenticated using (true);
drop policy if exists inventory_logs_insert on public.inventory_logs;
create policy inventory_logs_insert on public.inventory_logs for insert to authenticated with check (true);
drop policy if exists inventory_logs_update on public.inventory_logs;
create policy inventory_logs_update on public.inventory_logs for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists inventory_logs_delete on public.inventory_logs;
create policy inventory_logs_delete on public.inventory_logs for delete to authenticated
  using (public.is_admin());

-- settings: read for all signed-in users; admin writes.
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated using (true);
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
