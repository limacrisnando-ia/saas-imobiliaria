-- Campos internos de origem e comissao em imoveis.
-- Assim como observacoes_documentacao, estes campos NUNCA sao expostos
-- ao anon: a tabela imoveis ja nao tem nenhum privilegio concedido a anon
-- (ver 20260817165236 e 20260817165606), e a view imoveis_publicos lista
-- colunas explicitamente — nao incluimos os novos campos nela, entao eles
-- ficam de fora automaticamente. So o role authenticated (admin) le e escreve.

create type public.origem_imovel as enum ('proprio', 'intermediacao');
create type public.tipo_comissao as enum ('percentual', 'fixo');

alter table public.imoveis
  add column origem                 public.origem_imovel not null default 'proprio',
  add column proprietario_nome      text,
  add column proprietario_contato   text,
  add column comissao_venda_tipo    public.tipo_comissao,
  add column comissao_venda_valor   numeric(12,2) check (comissao_venda_valor >= 0),
  add column comissao_aluguel_tipo  public.tipo_comissao,
  add column comissao_aluguel_valor numeric(12,2) check (comissao_aluguel_valor >= 0);

comment on column public.imoveis.origem is
  'INTERNO. proprio = imovel da imobiliaria; intermediacao = de terceiro. Nunca exposto na view imoveis_publicos.';
comment on column public.imoveis.proprietario_nome is
  'INTERNO. Preenchido so quando origem = intermediacao.';
comment on column public.imoveis.proprietario_contato is
  'INTERNO. Preenchido so quando origem = intermediacao.';
comment on column public.imoveis.comissao_venda_tipo is
  'INTERNO. Nulo permitido; tipo da comissao de venda quando origem = intermediacao.';
comment on column public.imoveis.comissao_venda_valor is
  'INTERNO. Nulo permitido; valor da comissao de venda (percentual ou fixo conforme comissao_venda_tipo).';
comment on column public.imoveis.comissao_aluguel_tipo is
  'INTERNO. Nulo permitido; tipo da comissao de aluguel quando origem = intermediacao.';
comment on column public.imoveis.comissao_aluguel_valor is
  'INTERNO. Nulo permitido; valor da comissao de aluguel (percentual ou fixo conforme comissao_aluguel_tipo).';
