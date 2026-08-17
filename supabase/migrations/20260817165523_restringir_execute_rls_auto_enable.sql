-- Auditoria: o advisor apontou public.rls_auto_enable() como funcao
-- SECURITY DEFINER executavel por anon via /rest/v1/rpc/rls_auto_enable.
--
-- Na pratica a chamada ja falhava (retorna event_trigger, tipo que o PostgREST
-- nao consegue serializar, e pg_event_trigger_ddl_commands() so funciona dentro
-- de um evento DDL). Ainda assim, funcao SECURITY DEFINER alcancavel pelo anon
-- nao deve ficar de pe: tiramos o EXECUTE.
--
-- O gatilho `ensure_rls` (event trigger, dono postgres) continua funcionando:
-- o Postgres nao checa EXECUTE do usuario que roda o DDL na hora de disparar
-- um event trigger. Verificado empiricamente: apos este revoke, uma tabela
-- criada em public continuou nascendo com RLS ligado automaticamente.

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
