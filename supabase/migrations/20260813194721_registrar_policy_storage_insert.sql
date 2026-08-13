-- Registra no historico de migrations a policy de INSERT do bucket 'imoveis',
-- para que uma replica (outro cliente) reproduza o Storage inteiro so com as migrations.
drop policy if exists "Autenticado envia imagens" on storage.objects;

create policy "Autenticado envia imagens" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imoveis');
