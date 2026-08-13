-- Escrita no bucket 'imoveis': so autenticado. Leitura e publica (bucket public).
create policy "Autenticado atualiza imagens" on storage.objects
  for update to authenticated
  using (bucket_id = 'imoveis') with check (bucket_id = 'imoveis');

create policy "Autenticado remove imagens" on storage.objects
  for delete to authenticated
  using (bucket_id = 'imoveis');
