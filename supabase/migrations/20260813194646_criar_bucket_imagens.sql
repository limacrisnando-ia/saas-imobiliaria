-- Fase 1.1 — bucket de imagens (imoveis + logo da imobiliaria).
-- Leitura publica (bucket public = true dispensa policy de SELECT).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imoveis',
  'imoveis',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;
