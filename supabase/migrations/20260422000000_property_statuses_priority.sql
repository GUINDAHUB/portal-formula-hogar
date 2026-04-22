-- Estados de vivienda: urgent, available, searching, unavailable.
-- Orden del portal: urgent > available > searching > unavailable; dentro de cada estado por rentabilidad desc.

alter table public.properties
drop constraint if exists properties_status_check;

-- Migración de estado antiguo para mantener consistencia con el nuevo set permitido.
update public.properties
set status = 'searching'
where status = 'reserved';

alter table public.properties
add constraint properties_status_check
check (status in ('available', 'urgent', 'searching', 'unavailable'));

create or replace function public.get_portal_by_code(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.client_links%rowtype;
  props jsonb;
  client_name text;
begin
  select * into link
  from public.client_links
  where access_code = upper(trim(p_code));

  if not found then
    return jsonb_build_object('status', 'not_found', 'properties', '[]'::jsonb, 'client_name', null);
  end if;

  if not link.is_active then
    return jsonb_build_object('status', 'inactive', 'properties', '[]'::jsonb, 'client_name', null);
  end if;

  if link.expires_at <= now() then
    return jsonb_build_object('status', 'expired', 'properties', '[]'::jsonb, 'client_name', null);
  end if;

  select c.name into client_name
  from public.clients c
  where c.id = link.client_id;

  select coalesce(
    jsonb_agg(
      to_jsonb(t)
      order by
        case t.status
          when 'urgent' then 0
          when 'available' then 1
          when 'searching' then 2
          else 3
        end,
        t.yield_percent desc nulls last,
        t.created_at desc
    ),
    '[]'::jsonb
  )
  into props
  from (
    select p.*
    from public.properties p
    inner join public.client_link_properties clp on clp.property_id = p.id
    where clp.client_link_id = link.id
      and p.status in ('urgent', 'available', 'searching')
    union
    select p.*
    from public.properties p
    where p.status = 'unavailable'
  ) t;

  return jsonb_build_object(
    'status', 'ok',
    'properties', props,
    'client_name', to_jsonb(coalesce(client_name, ''))
  );
end;
$$;

grant execute on function public.get_portal_by_code(text) to anon, authenticated;

create or replace function public.portal_access(p_code text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select public.get_portal_by_code(p_code)::json;
$$;

grant execute on function public.portal_access(text) to anon, authenticated;
