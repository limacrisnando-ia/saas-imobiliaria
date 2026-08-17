-- Auditoria de seguranca — corrige dois grants frouxos herdados dos
-- ALTER DEFAULT PRIVILEGES do Supabase (que concedem ALL a anon/authenticated
-- em toda tabela/view nova no schema public).
--
-- Bug 1: em 20260813194626 o revoke da view foi "from public" (pseudo-role PUBLIC),
--        e nao "from anon, authenticated". Como o default privilege ja tinha dado
--        ALL diretamente a esses dois roles, o revoke nao surtiu efeito e o anon
--        ficou com INSERT/UPDATE/DELETE/TRUNCATE na view imoveis_publicos.
--        Hoje nao e exploravel porque a view tem JOIN (nao e auto-updatable), mas
--        a view roda com security_invoker = false: se um dia ela virar single-table
--        ou ganhar um INSTEAD OF trigger, a escrita do anon rodaria como o DONO,
--        furando o RLS inteiro. Fechamos agora.
--
-- Bug 2: em 20260813194006 os revokes enumeravam so insert/update/delete,
--        deixando TRUNCATE, REFERENCES e TRIGGER com o anon. TRUNCATE nao passa
--        por RLS (esvaziaria a tabela); nao e alcancavel via PostgREST, mas
--        contraria o minimo privilegio.
--
-- Padrao adotado: "revoke all" e depois conceder so o necessario, em vez de
-- enumerar o que tirar — assim nenhum privilegio novo escapa no futuro.

-- A view e somente leitura para todo mundo. O admin escreve na tabela base.
revoke all on public.imoveis_publicos from anon, authenticated;
grant select on public.imoveis_publicos to anon, authenticated;

-- Tabelas que o anon pode apenas ler.
revoke all on public.configuracoes  from anon;
revoke all on public.tipos_imovel   from anon;
revoke all on public.imovel_imagens from anon;
grant select on public.configuracoes  to anon;
grant select on public.tipos_imovel   to anon;
grant select on public.imovel_imagens to anon;

-- Tabelas que o anon nao toca (reafirmado; ja estavam corretas).
revoke all on public.imoveis from anon;
revoke all on public.visitas from anon;
