-- RLS: sustituir "TO authenticated" por comprobación de sesión Supabase Auth.
-- PostgREST aplica políticas con el JWT; auth.uid() IS NOT NULL es fiable para admins logueados.

drop policy if exists "properties_admin_all" on public.properties;
drop policy if exists "clients_admin_all" on public.clients;
drop policy if exists "client_links_admin_all" on public.client_links;
drop policy if exists "client_link_properties_admin_all" on public.client_link_properties;

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

-- Storage: mismo criterio (evita fallos en upload con TO authenticated)

drop policy if exists "property_images_auth_write" on storage.objects;
drop policy if exists "property_images_auth_update" on storage.objects;
drop policy if exists "property_images_auth_delete" on storage.objects;
drop policy if exists "property_pdfs_auth_write" on storage.objects;
drop policy if exists "property_pdfs_auth_update" on storage.objects;
drop policy if exists "property_pdfs_auth_delete" on storage.objects;

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
