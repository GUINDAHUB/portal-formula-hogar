-- Portal: en cada enlace se eligen solo propiedades disponibles; reservadas y no disponibles
-- son comunes a todos los enlaces (se incluyen siempre desde el catálogo global).

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
begin
  select * into link
  from public.client_links
  where access_code = upper(trim(p_code));

  if not found then
    return jsonb_build_object('status', 'not_found', 'properties', '[]'::jsonb);
  end if;

  if not link.is_active then
    return jsonb_build_object('status', 'inactive', 'properties', '[]'::jsonb);
  end if;

  if link.expires_at <= now() then
    return jsonb_build_object('status', 'expired', 'properties', '[]'::jsonb);
  end if;

  select coalesce(
    jsonb_agg(
      to_jsonb(t)
      order by
        case t.status
          when 'available' then 0
          when 'reserved' then 1
          else 2
        end,
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
      and p.status = 'available'
    union
    select p.*
    from public.properties p
    where p.status in ('reserved', 'unavailable')
  ) t;

  return jsonb_build_object('status', 'ok', 'properties', props);
end;
$$;

grant execute on function public.get_portal_by_code(text) to anon, authenticated;

-- Alias retrocompatible: misma respuesta que get_portal_by_code (status + properties).
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
