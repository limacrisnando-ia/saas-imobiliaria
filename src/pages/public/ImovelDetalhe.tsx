import { useEffect, useState } from 'react'
import { ArrowLeft, Bath, Bed, Car, FileText, MapPin, MessageCircle, Repeat, Ruler } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useBranding } from '@/hooks/use-branding'
import { useSeo } from '@/hooks/use-seo'
import { linkWhatsApp } from '@/lib/branding'
import { CORES_STATUS, ROTULOS_FINALIDADE, ROTULOS_STATUS, valorExibido } from '@/lib/imovel-labels'
import { idDoSlug } from '@/lib/slug'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

// Seleção explícita de colunas, como um único literal — o supabase-js só
// infere o tipo de retorno quando a string do .select() é um literal direto
// na chamada (não uma const construída com `+`, que vira `string` genérico
// pro type-checker). observacoes_documentacao entra aqui de propósito: a view
// só a preenche quando documentacao_publica = true (nula caso contrário),
// então "vem null" já é o comportamento de esconder — não precisamos buscar
// documentacao_publica em si, só respeitar o que a view decidiu devolver.
type Imovel = Pick<
  Tables<'imoveis_publicos'>,
  | 'id'
  | 'titulo'
  | 'descricao'
  | 'tipo_id'
  | 'tipo_nome'
  | 'finalidade'
  | 'valor_venda'
  | 'valor_aluguel'
  | 'taxas_adicionais'
  | 'aceita_permuta'
  | 'permuta_obs'
  | 'cidade'
  | 'bairro'
  | 'endereco'
  | 'quartos'
  | 'banheiros'
  | 'vagas'
  | 'area_construida'
  | 'area_total'
  | 'comodidades'
  | 'status'
  | 'destaque'
  | 'observacoes_documentacao'
  | 'criado_em'
  | 'atualizado_em'
>

function truncar(texto: string, tamanho: number): string {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  return limpo.length > tamanho ? `${limpo.slice(0, tamanho - 1)}…` : limpo
}

function descricaoSeoDoImovel(imovel: Imovel): string {
  if (imovel.descricao) return truncar(imovel.descricao, 155)
  const partes = [
    imovel.tipo_nome,
    imovel.quartos !== null ? `${imovel.quartos} quarto(s)` : null,
    [imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || null,
    valorExibido(imovel),
  ].filter(Boolean)
  return partes.join(' · ')
}

export default function ImovelDetalhe() {
  const { slug } = useParams<{ slug: string }>()
  const branding = useBranding()

  // undefined = carregando · null = não encontrado (inclui não publicado/vendido)
  const [imovel, setImovel] = useState<Imovel | null | undefined>(undefined)
  const [imagens, setImagens] = useState<Tables<'imovel_imagens'>[]>([])
  const [imagemAtiva, setImagemAtiva] = useState(0)

  useEffect(() => {
    let ativo = true
    setImovel(undefined)
    setImagens([])
    setImagemAtiva(0)

    const id = slug ? idDoSlug(slug) : null
    if (!id) {
      setImovel(null)
      return
    }

    async function carregar(idImovel: string) {
      const { data } = await supabase
        .from('imoveis_publicos')
        .select(
          'id, titulo, descricao, tipo_id, tipo_nome, finalidade, valor_venda, valor_aluguel, taxas_adicionais, aceita_permuta, permuta_obs, cidade, bairro, endereco, quartos, banheiros, vagas, area_construida, area_total, comodidades, status, destaque, observacoes_documentacao, criado_em, atualizado_em'
        )
        .eq('id', idImovel)
        .maybeSingle()

      if (!ativo) return
      // Sem linha = ou não existe, ou não está publicado, ou está
      // vendido/alugado — a view já filtrou; aqui é só o "não encontrado".
      setImovel(data ?? null)
      if (!data) return

      const { data: imgs } = await supabase
        .from('imovel_imagens')
        .select('*')
        .eq('imovel_id', idImovel)
        .order('ordem', { ascending: true })

      if (!ativo) return
      setImagens(imgs ?? [])
    }

    carregar(id)
    return () => {
      ativo = false
    }
  }, [slug])

  // useSeo precisa rodar sempre, nos três estados (carregando/não encontrado/
  // carregado) — por isso vem antes dos `return` condicionais abaixo, com
  // valores que fazem sentido pra cada caso.
  const capa = imagens.find((img) => img.capa) ?? imagens[0]
  useSeo({
    title: imovel
      ? `${imovel.titulo} — ${branding.nome}`
      : imovel === null
        ? `Imóvel não encontrado — ${branding.nome}`
        : branding.nome,
    description: imovel
      ? descricaoSeoDoImovel(imovel)
      : `Confira os imóveis disponíveis com a ${branding.nome}.`,
    image: capa?.url,
    type: imovel ? 'article' : 'website',
  })

  if (imovel === undefined) {
    return <p className="mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground sm:px-6">Carregando…</p>
  }

  if (imovel === null) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6">
        <h1 className="text-xl font-medium">Imóvel não encontrado</h1>
        <p className="text-sm text-muted-foreground">
          Este imóvel não existe, foi removido do catálogo ou já não está disponível.
        </p>
        <Link
          to="/imoveis"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" />
          Ver outros imóveis
        </Link>
      </div>
    )
  }

  const mensagemWhats = `Olá! Tenho interesse no imóvel "${imovel.titulo}" (${window.location.href}).`
  const linkWhats = linkWhatsApp(branding.whatsapp, mensagemWhats)
  const localizacao = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ')

  return (
    <div className="pb-24 sm:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          to="/imoveis"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para imóveis
        </Link>

        {/* Galeria */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
            {imagens[imagemAtiva] ? (
              <img
                src={imagens[imagemAtiva]!.url}
                alt={imovel.titulo ?? ''}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Sem fotos
              </div>
            )}
          </div>

          {imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((img, indice) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImagemAtiva(indice)}
                  className={cn(
                    'size-16 shrink-0 overflow-hidden rounded-lg border-2',
                    indice === imagemAtiva ? 'border-foreground' : 'border-transparent'
                  )}
                >
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {imovel.tipo_nome && <Badge variant="secondary">{imovel.tipo_nome}</Badge>}
                {imovel.finalidade && (
                  <Badge variant="outline">{ROTULOS_FINALIDADE[imovel.finalidade]}</Badge>
                )}
                {imovel.status && (
                  <Badge className={cn('border-transparent', CORES_STATUS[imovel.status])}>
                    {ROTULOS_STATUS[imovel.status]}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-medium sm:text-3xl">{imovel.titulo}</h1>
              {localizacao && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {localizacao}
                  {imovel.endereco && ` · ${imovel.endereco}`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-6 rounded-xl border border-border p-4">
              {imovel.quartos !== null && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Bed className="size-4 text-muted-foreground" />
                  {imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}
                </span>
              )}
              {imovel.banheiros !== null && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Bath className="size-4 text-muted-foreground" />
                  {imovel.banheiros} {imovel.banheiros === 1 ? 'banheiro' : 'banheiros'}
                </span>
              )}
              {imovel.vagas !== null && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Car className="size-4 text-muted-foreground" />
                  {imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}
                </span>
              )}
              {imovel.area_construida !== null && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Ruler className="size-4 text-muted-foreground" />
                  {imovel.area_construida} m² construídos
                </span>
              )}
              {imovel.area_total !== null && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Ruler className="size-4 text-muted-foreground" />
                  {imovel.area_total} m² de área total
                </span>
              )}
            </div>

            {imovel.descricao && (
              <div className="flex flex-col gap-2">
                <h2 className="font-medium">Descrição</h2>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {imovel.descricao}
                </p>
              </div>
            )}

            {imovel.comodidades && imovel.comodidades.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="font-medium">Comodidades</h2>
                <div className="flex flex-wrap gap-1.5">
                  {imovel.comodidades.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {imovel.observacoes_documentacao && (
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
                <h2 className="flex items-center gap-1.5 font-medium">
                  <FileText className="size-4 shrink-0" />
                  Documentação
                </h2>
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {imovel.observacoes_documentacao}
                </p>
              </div>
            )}

            {(imovel.taxas_adicionais || imovel.aceita_permuta) && (
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {imovel.taxas_adicionais && <p>Taxas: {imovel.taxas_adicionais}</p>}
                {imovel.aceita_permuta && (
                  <p className="flex items-center gap-1.5">
                    <Repeat className="size-4 shrink-0" />
                    Aceita permuta{imovel.permuta_obs ? ` — ${imovel.permuta_obs}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Card de preço + CTA, fixo ao rolar em telas grandes */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-4 rounded-xl border border-border p-5 lg:sticky lg:top-20">
              <div>
                <p className="text-xs text-muted-foreground">Valor</p>
                <p className="text-xl font-semibold" style={{ color: branding.corPrimaria }}>
                  {valorExibido(imovel, 'Consulte-nos')}
                </p>
              </div>

              {linkWhats && (
                <a
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: branding.corPrimaria }}
                >
                  <MessageCircle className="size-4" />
                  Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra fixa no mobile — mantém o CTA à mão sem precisar rolar de volta */}
      {linkWhats && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-background p-3 sm:hidden">
          <p className="min-w-0 truncate text-sm font-medium" style={{ color: branding.corPrimaria }}>
            {valorExibido(imovel, 'Consulte-nos')}
          </p>
          <a
            href={linkWhats}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: branding.corPrimaria }}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
