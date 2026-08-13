-- Fase 1.1 — RLS em todas as tabelas + grants explicitos
-- Regra geral: authenticated faz tudo (single-tenant, um admin).
--              anon so le o que a modelagem permite.

alter table public.configuracoes  enable row level security;
alter table public.tipos_imovel   enable row level security;
alter table public.imoveis        enable row level security;
alter table public.imovel_imagens enable row level security;
alter table public.visitas        enable row level security;

-- ------------------------------------------------------------
-- Helper: um imovel esta visivel no site?
-- SECURITY DEFINER porque o anon nao enxerga public.imoveis; sem isso
-- o EXISTS dentro da policy de imovel_imagens rodaria sob o RLS do anon
-- e nenhuma imagem apareceria no site.
--
-- NOTA: a migration 20260813200343 move esta funcao para o schema `privado`,
-- porque em `public` o PostgREST a expunha como endpoint /rest/v1/rpc/.
-- ------------------------------------------------------------
create or replace function public.imovel_esta_publico(p_imovel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.imoveis i
    where i.id = p_imovel_id
      and i.publicado
      and i.status in ('disponivel', 'reservado')
  );
$$;

revoke all on function public.imovel_esta_publico(uuid) from public;
grant execute on function public.imovel_esta_publico(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- configuracoes: anon le, authenticated escreve
-- ------------------------------------------------------------
revoke insert, update, delete on public.configuracoes from anon;

create policy "Anon le configuracoes"
  on public.configuracoes for select to anon using (true);

create policy "Autenticado gerencia configuracoes"
  on public.configuracoes for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- tipos_imovel: anon le, authenticated escreve
-- ------------------------------------------------------------
revoke insert, update, delete on public.tipos_imovel from anon;

create policy "Anon le tipos de imovel"
  on public.tipos_imovel for select to anon using (true);

create policy "Autenticado gerencia tipos de imovel"
  on public.tipos_imovel for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- imoveis: anon NAO toca. Site le pela view imoveis_publicos.
-- Sem policy para anon = zero linhas; o REVOKE e a segunda tranca.
-- ------------------------------------------------------------
revoke all on public.imoveis from anon;

create policy "Autenticado gerencia imoveis"
  on public.imoveis for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- imovel_imagens: anon le so imagens de imovel publicado e disponivel/reservado
-- ------------------------------------------------------------
revoke insert, update, delete on public.imovel_imagens from anon;

create policy "Anon le imagens de imoveis publicos"
  on public.imovel_imagens for select to anon
  using (public.imovel_esta_publico(imovel_id));

create policy "Autenticado gerencia imagens"
  on public.imovel_imagens for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- visitas: SOMENTE autenticado. Anon nao le nem escreve.
-- ------------------------------------------------------------
revoke all on public.visitas from anon;

create policy "Autenticado gerencia visitas"
  on public.visitas for all to authenticated using (true) with check (true);
