-- Portal Fórmula Hogar — esquema inicial
-- Ejecutar en Supabase SQL Editor o: supabase db push

create extension if not exists "pgcrypto";

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  total_investment numeric,
  purchase_price numeric,
  duration_years integer,
  yield_percent numeric,
  status text not null default 'available',
  image_url text,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_status_check check (status in ('available', 'reserved', 'unavailable'))
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.client_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  access_code text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index client_links_access_code_idx on public.client_links (access_code);
create index client_links_client_id_idx on public.client_links (client_id);

create table public.client_link_properties (
  id uuid primary key default gen_random_uuid(),
  client_link_id uuid not null references public.client_links (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  unique (client_link_id, property_id)
);

create index clp_link_idx on public.client_link_properties (client_link_id);
create index clp_property_idx on public.client_link_properties (property_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

-- Portal: una sola llamada (anon) sin exponer tablas directamente
create or replace function public.portal_access(p_code text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  link public.client_links%rowtype;
  props json;
begin
  select * into link
  from public.client_links
  where access_code = upper(trim(p_code));

  if not found then
    return json_build_object('error', 'invalid', 'properties', '[]'::json);
  end if;

  if not link.is_active then
    return json_build_object('error', 'inactive', 'properties', '[]'::json);
  end if;

  if link.expires_at <= now() then
    return json_build_object('error', 'expired', 'properties', '[]'::json);
  end if;

  select coalesce(json_agg(to_jsonb(p) order by p.created_at desc), '[]'::json)
  into props
  from public.properties p
  inner join public.client_link_properties clp on clp.property_id = p.id
  where clp.client_link_id = link.id;

  return json_build_object('error', null, 'properties', props);
end;
$$;

grant execute on function public.portal_access(text) to anon, authenticated;

alter table public.properties enable row level security;
alter table public.clients enable row level security;
alter table public.client_links enable row level security;
alter table public.client_link_properties enable row level security;

create policy "properties_admin_all"
on public.properties
for all
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "clients_admin_all"
on public.clients
for all
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "client_links_admin_all"
on public.client_links
for all
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "client_link_properties_admin_all"
on public.client_link_properties
for all
to public
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Storage
insert into storage.buckets (id, name, public)
values
  ('property-images', 'property-images', true),
  ('property-pdfs', 'property-pdfs', true)
on conflict (id) do nothing;

create policy "property_images_public_read"
on storage.objects for select
using (bucket_id = 'property-images');

create policy "property_images_auth_write"
on storage.objects for insert
to public
with check (
  bucket_id = 'property-images'
  and auth.uid() is not null
);

create policy "property_images_auth_update"
on storage.objects for update
to public
using (bucket_id = 'property-images' and auth.uid() is not null)
with check (bucket_id = 'property-images' and auth.uid() is not null);

create policy "property_images_auth_delete"
on storage.objects for delete
to public
using (bucket_id = 'property-images' and auth.uid() is not null);

create policy "property_pdfs_public_read"
on storage.objects for select
using (bucket_id = 'property-pdfs');

create policy "property_pdfs_auth_write"
on storage.objects for insert
to public
with check (
  bucket_id = 'property-pdfs'
  and auth.uid() is not null
);

create policy "property_pdfs_auth_update"
on storage.objects for update
to public
using (bucket_id = 'property-pdfs' and auth.uid() is not null)
with check (bucket_id = 'property-pdfs' and auth.uid() is not null);

create policy "property_pdfs_auth_delete"
on storage.objects for delete
to public
using (bucket_id = 'property-pdfs' and auth.uid() is not null);
