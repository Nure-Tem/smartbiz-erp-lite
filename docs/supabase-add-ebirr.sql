-- SmartBiz ERP Lite — add ebirr to payment_method enum
-- Run ONCE in the Supabase SQL editor if 'ebirr' is not already present.

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    join pg_namespace n on t.typnamespace = n.oid
    where n.nspname = 'public'
      and t.typname = 'payment_method'
      and e.enumlabel = 'ebirr'
  ) then
    alter type public.payment_method add value 'ebirr';
  end if;
end
$$;
