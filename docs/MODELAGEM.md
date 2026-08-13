# Modelagem do banco — Catálogo Ribeiro Imobiliária

**O que é este documento:** a descrição conceitual (a "planta") do banco de dados.
NÃO é SQL e NÃO é o banco em si. Na Fase 1.1, o Claude Code lê este arquivo e cria as tabelas,
a view pública e as políticas de RLS no Supabase, via MCP. Este documento é a fonte de verdade
do schema — se algo divergir entre o código e este arquivo, este arquivo vence.

**Princípios que valem para todo o banco:**
- Single-tenant: este banco atende só a Ribeiro. Nada de workspaces ou multi-tenant.
- Escrita (criar/editar/apagar) em qualquer tabela: só usuário autenticado.
- O site público lê apenas o que é permitido, e sempre pela VIEW pública — nunca a tabela base.
- Campo interno nunca vai para o público (detalhado na tabela `imoveis`).
- Branding vive em `configuracoes`, nunca hardcoded no código.

---

## Tabela: configuracoes (singleton — 1 linha só)

Guarda a identidade da imobiliária. É o que torna o sistema white-label: trocar de cliente =
trocar o conteúdo desta linha.

| Campo          | Tipo              | Observação                                        |
|----------------|-------------------|---------------------------------------------------|
| id             | identificador     | chave primária                                    |
| nome           | texto             | nome exibido no site (ex.: Ribeiro Imobiliária)   |
| whatsapp       | texto             | número de atendimento, usado no botão wa.me       |
| instagram      | texto             | @ do perfil                                       |
| endereco       | texto             | endereço exibido no rodapé                        |
| logo_url       | texto             | link da logo no Storage                           |
| cor_primaria   | texto             | cor da marca (hex)                                |
| cor_secundaria | texto             | cor de apoio (hex), opcional                      |
| atualizado_em  | data/hora         | timestamp de atualização                          |

**Acesso:** anon pode ler. Só autenticado escreve.

---

## Tabela: tipos_imovel (lista de apoio, editável)

Os tipos que a Ribeiro usa. Fica em tabela (não fixo no código) para o Ari poder adicionar tipos
novos sozinho. Valores iniciais: casa, apartamento, terreno, ponto comercial, chácara, kitnet.

| Campo   | Tipo          | Observação                     |
|---------|---------------|--------------------------------|
| id      | identificador | chave primária                 |
| nome    | texto         | nome do tipo                   |
| ativo   | booleano      | permite ocultar sem apagar     |

**Acesso:** anon pode ler. Só autenticado escreve.

---

## Tabela: imoveis (tabela central)

O coração do sistema. Dividida em três blocos por finalidade: campos públicos (vão pro site),
campo interno (nunca vai pro site) e campos de controle.

### Campos públicos
| Campo            | Tipo          | Observação                                                    |
|------------------|---------------|--------------------------------------------------------------|
| id               | identificador | chave primária                                               |
| titulo           | texto         | ex.: "Casa 3 quartos no Centro"                              |
| descricao        | texto longo   | descrição comercial                                          |
| tipo_id          | referência    | aponta para tipos_imovel                                     |
| finalidade       | texto/enum    | venda, aluguel ou ambos                                      |
| valor_venda      | número        | opcional (preenchido se for venda ou ambos)                 |
| valor_aluguel    | número        | opcional (valor mensal; preenchido se for aluguel ou ambos) |
| taxas_adicionais | texto         | ex.: condomínio, IPTU — descrição livre                     |
| aceita_permuta   | booleano      | aceita negociação/carro                                      |
| permuta_obs      | texto         | detalhe da permuta, opcional                                 |
| cidade           | texto         |                                                              |
| bairro           | texto         |                                                              |
| endereco         | texto         |                                                              |
| quartos          | número        |                                                              |
| banheiros        | número        |                                                              |
| vagas            | número        | vagas de garagem                                             |
| area_construida  | número        | m² construídos                                               |
| area_total       | número        | m² do terreno/área total                                     |
| comodidades      | lista flexível| mobiliado, condomínio fechado, etc. — cresce sem mudar schema|
| status           | texto/enum    | disponivel, reservado, vendido, alugado                     |

### Campo de documentação (interno por padrão, publicável caso a caso)
| Campo                    | Tipo        | Observação                                                        |
|--------------------------|-------------|------------------------------------------------------------------|
| observacoes_documentacao | texto longo | pendências de documentação. Opcional. Interno por padrão.        |
| documentacao_publica     | booleano    | padrão FALSE. Só quando TRUE a observação acima aparece no site. |

**Regra do campo de documentação (importante):** este campo é opcional e, por padrão, interno.
O Ari decide imóvel a imóvel se quer publicá-lo, ligando `documentacao_publica`. O padrão FALSE é a
rede de segurança: no silêncio, a observação NÃO vai para o site. A proteção mora na view pública
(abaixo), não só na tela — quem consultar a API direta também não vê a observação enquanto o
interruptor estiver desligado.

### Campos de controle
| Campo         | Tipo      | Observação                                              |
|---------------|-----------|---------------------------------------------------------|
| publicado     | booleano  | controla se aparece no site                             |
| destaque      | booleano  | para destacar na home                                   |
| criado_em     | data/hora | timestamp de cadastro                                   |
| atualizado_em | data/hora | timestamp da última edição, mantido por trigger no banco |

**Regra de negócio:** imóvel com status `vendido` ou `alugado` continua no banco (histórico),
mas some do site automaticamente. No site só aparece o que estiver `publicado = true` E com
status em (`disponivel`, `reservado`).

**Acesso:** anon NÃO lê esta tabela diretamente (ver view pública abaixo). Só autenticado escreve
e lê a tabela completa (incluindo o campo interno).

---

## Tabela: imovel_imagens (galeria)

Várias imagens por imóvel. Os arquivos ficam no Storage; a tabela guarda o link e a ordem.

| Campo     | Tipo          | Observação                          |
|-----------|---------------|-------------------------------------|
| id        | identificador | chave primária                      |
| imovel_id | referência    | aponta para imoveis                 |
| url       | texto         | link da imagem no Storage           |
| ordem     | número        | ordem de exibição                   |
| capa      | booleano      | uma por imóvel; é a imagem principal|

**Acesso:** anon lê apenas imagens de imóveis que estão públicos. Autenticado lê tudo e escreve.

A política do anon usa a função `privado.imovel_esta_publico(uuid)`. Ela é `SECURITY DEFINER` por
necessidade: um `EXISTS` direto contra `imoveis` dentro da política rodaria sob o RLS do anon — que
não enxerga a tabela — e nenhuma imagem apareceria no site. Fica no schema `privado` (não exposto
pelo PostgREST) para não virar um endpoint `/rest/v1/rpc/`.

---

## Tabela: visitas (registro interno — nunca aparece no site)

Log simples de visitas. NÃO é agendamento: não tem disponibilidade, data futura nem confirmação.

| Campo             | Tipo          | Observação                     |
|-------------------|---------------|--------------------------------|
| id                | identificador | chave primária                 |
| imovel_id         | referência    | aponta para imoveis            |
| visitante_nome    | texto         |                                |
| visitante_contato | texto         | telefone/e-mail                |
| data_visita       | data          | quando a visita ocorreu        |
| responsavel       | texto         | quem atendeu                   |
| observacoes       | texto longo   |                                |

**Acesso:** SOMENTE autenticado. Anon não lê nem escreve nada aqui.

---

## View pública: imoveis_publicos

A camada que protege o site. Como o RLS é por linha (não por coluna), a única forma limpa de
esconder o campo interno é uma view que o omite.

Esta view retorna **apenas**:
- imóveis com `publicado = true` E status em (`disponivel`, `reservado`);
- a coluna `observacoes_documentacao` **somente quando** `documentacao_publica = true`; quando for
  `false`, a view devolve esse campo vazio/nulo, mesmo que haja texto escrito no painel.

Só esta view é legível por anon. O site público sempre consulta `imoveis_publicos`, nunca a
tabela `imoveis`. A tabela base `imoveis` (com a observação de documentação sempre visível para o
Ari) continua acessível apenas ao usuário autenticado.

Além disso, a view:
- traz `tipo_nome` já resolvido (join com `tipos_imovel`), para o site não precisar de segunda consulta;
- **não expõe** `documentacao_publica` nem `publicado` — o site não tem por que saber do interruptor.

**Nota técnica (por que o linter reclama):** a view roda com os privilégios do dono
(`security_invoker = false`, o padrão do Postgres). É isso que permite ela ler `imoveis` enquanto o
anon não tem privilégio nenhum na tabela base. O advisor do Supabase marca isso como
`security_definer_view` (ERROR) — aqui é intencional: o filtro está dentro da view e
`security_barrier` está ativo. A alternativa exigiria dar SELECT ao anon em `imoveis`, o que vazaria
a observação de documentação.

---

## Storage: bucket de imagens

Bucket `imoveis`, para as imagens dos imóveis (e a logo da imobiliária).
- Leitura: pública (bucket `public = true`, portanto não precisa de política de SELECT).
- Escrita/atualização/remoção: só autenticado, via políticas em `storage.objects` restritas a
  `bucket_id = 'imoveis'`.
- Limite de 5 MB por arquivo; MIME types aceitos: jpeg, png, webp, avif, svg.

---

## Usuário admin

Não é uma tabela criada por nós — é o Supabase Auth nativo. Um único usuário, com o e-mail do
contrato do Ari. A senha é definida por ele no primeiro acesso. Estrutura pronta para mais
usuários no futuro, se virar proposta nova.
