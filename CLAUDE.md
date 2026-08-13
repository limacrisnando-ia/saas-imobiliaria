# Projeto: Catálogo imobiliário white-label (Ribeiro Imobiliária)

## Contexto
- App único (Vite + React + TypeScript) com DUAS áreas: painel admin (rotas protegidas)
  e site público (rotas abertas), no mesmo build. Roteamento com React Router.
- Backend 100% no Supabase (Auth + Postgres + Storage). NÃO há backend próprio no Cloudflare.
- Hospedagem: Cloudflare PAGES (deploy estático por git-push). NÃO usar Workers/OpenNext/SSR.
- Single-tenant: este deploy atende só a Ribeiro. O white-label é por RÉPLICA (outro cliente =
  outro Supabase + outro deploy, a partir deste mesmo código). NÃO criar workspaces nem multi-tenant.

## Regras invioláveis
- No cliente usamos SOMENTE a anon key (VITE_SUPABASE_ANON_KEY), via env. NUNCA a service role key.
- Segurança por RLS. O site público SÓ enxerga imóveis publicados e disponíveis, através de uma
  VIEW pública — nunca a tabela base direto.
- Campo interno "observacoes_documentacao" NUNCA vai para o site (só aparece no painel). Como RLS é
  por linha, a proteção da coluna se faz pela view pública que a omite.
- A aba "visitas" é registro interno (log). Nunca exposta ao público. Não é agendamento.
- Identidade/branding (nome, WhatsApp, cores, logo) vive na tabela "configuracoes", NUNCA hardcoded
  no código — é isso que torna o sistema replicável.
- UI em pt-BR, mobile-first, com shadcn/ui. Copy com verbos diretos, sentence case.

## Tabelas (o schema é criado por nós na Fase 1)
- configuracoes (singleton): nome, whatsapp, instagram, endereco, logo_url, cores.
- tipos_imovel: lista editável (casa, apartamento, terreno, ponto comercial, chácara, kitnet...).
- imoveis: campos públicos (título, descrição, tipo, finalidade venda/aluguel/ambos, valor_venda,
  valor_aluguel, taxas, aceita_permuta, endereço/bairro/cidade, quartos, banheiros, vagas,
  area_construida, area_total, comodidades, status, publicado, destaque) + campo INTERNO
  (observacoes_documentacao).
- imovel_imagens: galeria (imovel_id, url, ordem, capa).
- visitas: registro interno (imovel_id, visitante, contato, data_visita, responsavel, observacoes).

## Status → badge
disponivel → verde · reservado → âmbar · vendido/alugado → cinza (some do site, fica no histórico)