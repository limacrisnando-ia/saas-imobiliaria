-- Fase 1.1 — seeds
--
-- ATENCAO (replica white-label): este e o unico arquivo com dados especificos
-- do cliente. Para replicar o sistema para outra imobiliaria, troque o conteudo
-- do insert em `configuracoes` — o resto do schema serve a qualquer cliente.

insert into public.tipos_imovel (nome) values
  ('Casa'),
  ('Apartamento'),
  ('Terreno'),
  ('Ponto comercial'),
  ('Chácara'),
  ('Kitnet')
on conflict (nome) do nothing;

-- Singleton de identidade. logo_url e cores ficam nulos de proposito:
-- o Ari preenche pelo painel; o front usa fallback neutro (src/lib/branding.ts).
insert into public.configuracoes (nome, whatsapp, instagram, endereco)
values (
  'Ribeiro Imobiliária',
  '(86) 9 9411-1289',
  '@ribeirooimobiliaria',
  'Av. Piauí, nº 1850, sala A'
);
