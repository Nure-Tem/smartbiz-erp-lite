-- SmartBiz ERP Lite — secure sale stock deduction RPC
-- Run ONCE in the Supabase SQL editor of the existing project.
-- Does NOT create tables, rename columns, disable RLS, or replace is_admin().

-- Allows Cashiers to deduct stock during a sale without granting general
-- products UPDATE permission. The function is the authoritative stock check.

create or replace function public.deduct_stock_for_sale(
  product_id uuid,
  quantity integer,
  reason text default 'Sale'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_prev integer;
  v_new integer;
  v_name text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if quantity is null or quantity <= 0 then
    raise exception 'Quantity must be a positive integer';
  end if;

  select p.current_stock, p.name
  into v_prev, v_name
  from public.products p
  where p.id = deduct_stock_for_sale.product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if v_prev < quantity then
    raise exception 'Insufficient stock for %. Available: %.', v_name, v_prev;
  end if;

  v_new := v_prev - quantity;

  update public.products
  set current_stock = v_new
  where id = deduct_stock_for_sale.product_id;

  insert into public.inventory_logs (
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    reason,
    created_by
  ) values (
    deduct_stock_for_sale.product_id,
    'sale'::public.inventory_movement_type,
    quantity,
    v_prev,
    v_new,
    coalesce(reason, 'Sale'),
    v_user_id
  );

  return json_build_object(
    'product_id', deduct_stock_for_sale.product_id,
    'product_name', v_name,
    'previous_stock', v_prev,
    'new_stock', v_new,
    'quantity', quantity
  );
end;
$$;

revoke all on function public.deduct_stock_for_sale(uuid, integer, text) from public;
grant execute on function public.deduct_stock_for_sale(uuid, integer, text) to authenticated;

-- Optional: lock products UPDATE to Admin only (Cashiers use deduct_stock_for_sale).
-- Skip if your live policies already restrict products UPDATE to admins.
drop policy if exists products_update on public.products;
create policy products_update on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
