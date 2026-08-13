-- Fase 1.1 — tipos, tabelas base, indices e trigger de atualizado_em
-- Fonte de verdade: docs/MODELAGEM.md

create type public.finalidade_imovel as enum ('venda', 'aluguel', 'ambos');
create type public.status_imovel     as enum ('disponivel', 'reservado', 'vendido', 'alugado');

-- trigger compartilhado
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ============================================================
-- configuracoes (singleton: 1 linha so)
-- ============================================================
create table public.configuracoes (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  whatsapp       text,
  instagram      text,
  endereco       text,
  logo_url       text,
  cor_primaria   text,
  cor_secundaria text,
  atualizado_em  timestamptz not null default now()
);

create unique index configuracoes_singleton on public.configuracoes ((true));

create trigger configuracoes_atualizado_em
  before update on public.configuracoes
  for each row execute function public.tocar_atualizado_em();

comment on table public.configuracoes is
  'Identidade da imobiliaria (white-label). Singleton garantido por indice unico em ((true)).';

-- ============================================================
-- tipos_imovel
-- ============================================================
create table public.tipos_imovel (
  id    uuid primary key default gen_random_uuid(),
  nome  text not null unique,
  ativo boolean not null default true
);

comment on table public.tipos_imovel is
  'Lista editavel de tipos. Fica em tabela para o admin adicionar tipos sem deploy.';

-- ============================================================
-- imoveis (tabela central)
-- ============================================================
create table public.imoveis (
  id                       uuid primary key default gen_random_uuid(),
  -- publicos
  titulo                   text not null,
  descricao                text,
  tipo_id                  uuid not null references public.tipos_imovel (id) on delete restrict,
  finalidade               public.finalidade_imovel not null,
  valor_venda              numeric(12,2) check (valor_venda   >= 0),
  valor_aluguel            numeric(12,2) check (valor_aluguel >= 0),
  taxas_adicionais         text,
  aceita_permuta           boolean not null default false,
  permuta_obs              text,
  cidade                   text,
  bairro                   text,
  endereco                 text,
  quartos                  smallint check (quartos   >= 0),
  banheiros                smallint check (banheiros >= 0),
  vagas                    smallint check (vagas     >= 0),
  area_construida          numeric(10,2) check (area_construida >= 0),
  area_total               numeric(10,2) check (area_total      >= 0),
  comodidades              text[] not null default '{}',
  status                   public.status_imovel not null default 'disponivel',
  -- documentacao: interno por padrao, publicavel caso a caso
  observacoes_documentacao text,
  documentacao_publica     boolean not null default false,
  -- controle
  publicado                boolean not null default false,
  destaque                 boolean not null default false,
  criado_em                timestamptz not null default now(),
  atualizado_em            timestamptz not null default now()
);

create index imoveis_vitrine_idx   on public.imoveis (publicado, status);
create index imoveis_tipo_idx      on public.imoveis (tipo_id);
create index imoveis_local_idx     on public.imoveis (cidade, bairro);
create index imoveis_destaque_idx  on public.imoveis (destaque) where destaque;
create index imoveis_comodidades_idx on public.imoveis using gin (comodidades);

create trigger imoveis_atualizado_em
  before update on public.imoveis
  for each row execute function public.tocar_atualizado_em();

comment on column public.imoveis.observacoes_documentacao is
  'INTERNO por padrao. So vai para o site quando documentacao_publica = true (regra aplicada na view imoveis_publicos).';
comment on column public.imoveis.documentacao_publica is
  'Interruptor por imovel. FALSE (padrao) = a observacao de documentacao NAO aparece no site.';

-- ============================================================
-- imovel_imagens (galeria)
-- ============================================================
create table public.imovel_imagens (
  id        uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis (id) on delete cascade,
  url       text not null,
  ordem     smallint not null default 0,
  capa      boolean not null default false
);

create index imovel_imagens_ordem_idx on public.imovel_imagens (imovel_id, ordem);
create unique index imovel_imagens_capa_unica on public.imovel_imagens (imovel_id) where capa;

comment on index public.imovel_imagens_capa_unica is 'No maximo uma imagem de capa por imovel.';

-- ============================================================
-- visitas (registro interno — nunca publico)
-- ============================================================
create table public.visitas (
  id                uuid primary key default gen_random_uuid(),
  imovel_id         uuid not null references public.imoveis (id) on delete cascade,
  visitante_nome    text not null,
  visitante_contato text,
  data_visita       date not null default current_date,
  responsavel       text,
  observacoes       text
);

create index visitas_imovel_idx on public.visitas (imovel_id, data_visita desc);

comment on table public.visitas is
  'Log interno de visitas ocorridas. NAO e agendamento e nunca e exposto ao publico.';
