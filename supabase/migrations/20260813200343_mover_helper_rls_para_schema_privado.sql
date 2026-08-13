-- imovel_esta_publico() so serve ao RLS de imovel_imagens; nao deve ser um
-- endpoint da API. Em public, o PostgREST expunha /rest/v1/rpc/imovel_esta_publico,
-- permitindo sondar se um uuid qualquer e um imovel publicado.
-- O schema 'privado' nao esta na lista de schemas expostos do PostgREST.

create schema if not exists privado;
grant usage on schema privado to anon, authenticated;

create or replace function privado.imovel_esta_publico(p_imovel_id uuid)
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

revoke all on function privado.imovel_esta_publico(uuid) from public;
grant execute on function privado.imovel_esta_publico(uuid) to anon, authenticated;

-- repoe a policy apontando para a nova localizacao
drop policy "Anon le imagens de imoveis publicos" on public.imovel_imagens;

create policy "Anon le imagens de imoveis publicos"
  on public.imovel_imagens for select to anon
  using (privado.imovel_esta_publico(imovel_id));

drop function public.imovel_esta_publico(uuid);
