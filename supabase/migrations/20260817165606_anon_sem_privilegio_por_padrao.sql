-- Causa raiz dos dois grants frouxos corrigidos em 20260817165236:
-- o Supabase mantem ALTER DEFAULT PRIVILEGES concedendo ALL a anon e
-- authenticated em TODA tabela/view nova do schema public. Ou seja, cada
-- tabela criada daqui pra frente nasceria com o anon podendo (no nivel de
-- privilegio) inserir, atualizar, apagar e TRUNCATE.
--
-- O gatilho ensure_rls liga RLS automaticamente e, sem policy, isso ja barra
-- SELECT/INSERT/UPDATE/DELETE. Mas TRUNCATE NAO passa por RLS — uma tabela
-- nova ficaria truncavel pelo anon no nivel do banco.
--
-- Aqui invertemos o padrao para o role nao confiavel: anon nasce sem nada e
-- so recebe o que for concedido explicitamente (como ja e feito para a view
-- imoveis_publicos, configuracoes, tipos_imovel e imovel_imagens).
--
-- NAO mexemos em `authenticated`: e o admin unico deste projeto single-tenant,
-- que legitimamente precisa de DML em tudo. Assim tabelas futuras continuam
-- funcionando no painel sem grant manual, e o erro possivel passa a ser
-- "anon nao le a tabela nova" — que falha FECHADO e aparece no teste, em vez
-- de silenciosamente expor dados.
--
-- CONSEQUENCIA PARA FASES FUTURAS: toda tabela/view que o site publico
-- precisar ler exige um `grant select ... to anon` explicito na migration.

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;
