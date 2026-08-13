-- Fase 1.1 — a unica porta do site publico para o catalogo.
-- Duas protecoes embutidas:
--   1) so imovel publicado e com status disponivel/reservado;
--   2) observacoes_documentacao so aparece quando documentacao_publica = true.
-- documentacao_publica e publicado NAO sao expostos (o site nao precisa deles).

create view public.imoveis_publicos as
select
  i.id,
  i.titulo,
  i.descricao,
  i.tipo_id,
  t.nome as tipo_nome,
  i.finalidade,
  i.valor_venda,
  i.valor_aluguel,
  i.taxas_adicionais,
  i.aceita_permuta,
  i.permuta_obs,
  i.cidade,
  i.bairro,
  i.endereco,
  i.quartos,
  i.banheiros,
  i.vagas,
  i.area_construida,
  i.area_total,
  i.comodidades,
  i.status,
  i.destaque,
  i.criado_em,
  i.atualizado_em,
  case
    when i.documentacao_publica then i.observacoes_documentacao
    else null
  end as observacoes_documentacao
from public.imoveis i
join public.tipos_imovel t on t.id = i.tipo_id
where i.publicado
  and i.status in ('disponivel', 'reservado');

-- security_barrier: impede que uma funcao "vazada" no WHERE do chamador
-- rode antes dos filtros da view.
alter view public.imoveis_publicos set (security_barrier = true);

revoke all on public.imoveis_publicos from public;
grant select on public.imoveis_publicos to anon, authenticated;

comment on view public.imoveis_publicos is
  'Vitrine publica. INTENCIONALMENTE security_invoker = false (padrao do Postgres): a view roda como o dono e por isso le public.imoveis mesmo com o anon sem nenhum privilegio na tabela base. E isso que permite esconder observacoes_documentacao quando documentacao_publica = false. O advisor do Supabase marca isso como security_definer_view; aqui e o comportamento desejado, pois o filtro esta dentro da view e security_barrier esta ativo.';
