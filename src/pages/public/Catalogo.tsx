import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { CardImovel } from '@/components/public/CardImovel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBranding } from '@/hooks/use-branding'
import { useSeo } from '@/hooks/use-seo'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type ImovelCard = Tables<'imoveis_publicos'> & { capaUrl: string | null }

type Filtros = {
  tipoId: string
  finalidade: '' | 'venda' | 'aluguel'
  valorMin: string
  valorMax: string
  local: string
  quartosMin: string
}

const FILTROS_VAZIOS: Filtros = {
  tipoId: '',
  finalidade: '',
  valorMin: '',
  valorMax: '',
  local: '',
  quartosMin: '',
}

const TAMANHO_PAGINA = 9

function escaparIlike(texto: string): string {
  return texto.replace(/[%_]/g, '\\$&')
}

function buscarImoveis(filtros: Filtros, pagina: number) {
  let query = supabase.from('imoveis_publicos').select('*', { count: 'exact' })

  if (filtros.tipoId) query = query.eq('tipo_id', filtros.tipoId)
  if (filtros.finalidade === 'venda') query = query.in('finalidade', ['venda', 'ambos'])
  if (filtros.finalidade === 'aluguel') query = query.in('finalidade', ['aluguel', 'ambos'])

  const min = filtros.valorMin.trim() ? Number(filtros.valorMin) : null
  const max = filtros.valorMax.trim() ? Number(filtros.valorMax) : null
  if (min !== null || max !== null) {
    if (filtros.finalidade === 'aluguel') {
      if (min !== null) query = query.gte('valor_aluguel', min)
      if (max !== null) query = query.lte('valor_aluguel', max)
    } else if (filtros.finalidade === 'venda') {
      if (min !== null) query = query.gte('valor_venda', min)
      if (max !== null) query = query.lte('valor_venda', max)
    } else {
      // Sem finalidade escolhida: aceita se QUALQUER um dos dois preços cair na faixa.
      const condicao = (coluna: string) =>
        [min !== null ? `${coluna}.gte.${min}` : null, max !== null ? `${coluna}.lte.${max}` : null]
          .filter(Boolean)
          .join(',')
      query = query.or(`and(${condicao('valor_venda')}),and(${condicao('valor_aluguel')})`)
    }
  }

  const local = filtros.local.trim()
  if (local) {
    const termo = escaparIlike(local)
    query = query.or(`cidade.ilike.%${termo}%,bairro.ilike.%${termo}%`)
  }

  if (filtros.quartosMin) query = query.gte('quartos', Number(filtros.quartosMin))

  const de = pagina * TAMANHO_PAGINA
  const ate = de + TAMANHO_PAGINA - 1
  return query.order('criado_em', { ascending: false }).range(de, ate)
}

async function buscarCapas(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map()
  const { data } = await supabase
    .from('imovel_imagens')
    .select('imovel_id, url')
    .in('imovel_id', ids)
    .eq('capa', true)
  return new Map(data?.map((d) => [d.imovel_id, d.url]))
}

export default function Catalogo() {
  const branding = useBranding()

  useSeo({
    title: `Imóveis disponíveis — ${branding.nome}`,
    description: `Filtre por tipo, finalidade, cidade, valor e quartos entre os imóveis à venda e para alugar da ${branding.nome}.`,
  })

  const [tipos, setTipos] = useState<Tables<'tipos_imovel'>[]>([])
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS)
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(FILTROS_VAZIOS)

  const [imoveis, setImoveis] = useState<ImovelCard[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [pagina, setPagina] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('tipos_imovel')
      .select('*')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => setTipos(data ?? []))
  }, [])

  // Debounce: aplica os filtros 400ms depois da última mudança, pra não
  // disparar uma busca a cada tecla digitada nos campos de texto/valor.
  useEffect(() => {
    const handle = setTimeout(() => setFiltrosAplicados(filtros), 400)
    return () => clearTimeout(handle)
  }, [filtros])

  // Refaz a busca do zero sempre que os filtros aplicados mudam.
  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)

    buscarImoveis(filtrosAplicados, 0).then(async ({ data, error, count }) => {
      if (!ativo) return
      if (error) {
        setErro(error.message)
        setCarregando(false)
        return
      }

      const linhas = data ?? []
      const ids = linhas.map((i) => i.id).filter((id): id is string => id !== null)
      const capas = await buscarCapas(ids)
      if (!ativo) return

      setImoveis(linhas.map((i) => ({ ...i, capaUrl: capas.get(i.id!) ?? null })))
      setTotal(count ?? 0)
      setPagina(0)
      setCarregando(false)
    })

    return () => {
      ativo = false
    }
  }, [filtrosAplicados])

  async function carregarMais() {
    setCarregandoMais(true)
    const proximaPagina = pagina + 1
    const { data, error, count } = await buscarImoveis(filtrosAplicados, proximaPagina)

    if (error) {
      setErro(error.message)
      setCarregandoMais(false)
      return
    }

    const linhas = data ?? []
    const ids = linhas.map((i) => i.id).filter((id): id is string => id !== null)
    const capas = await buscarCapas(ids)

    setImoveis((atual) => [
      ...atual,
      ...linhas.map((i) => ({ ...i, capaUrl: capas.get(i.id!) ?? null })),
    ])
    setTotal(count ?? 0)
    setPagina(proximaPagina)
    setCarregandoMais(false)
  }

  function atualizarFiltro<K extends keyof Filtros>(campo: K, valor: Filtros[K]) {
    setFiltros((atual) => ({ ...atual, [campo]: valor }))
  }

  function limparFiltros() {
    setFiltros(FILTROS_VAZIOS)
  }

  const filtrosAtivos = Object.values(filtros).some((v) => v !== '')
  const temMais = total !== null && imoveis.length < total

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium sm:text-3xl">Imóveis disponíveis</h1>
        <p className="text-sm text-muted-foreground">
          {carregando ? 'Buscando…' : `${total ?? 0} imóvel(is) encontrado(s)`}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <Label htmlFor="filtro-tipo">Tipo</Label>
            <Select value={filtros.tipoId} onValueChange={(v) => atualizarFiltro('tipoId', v)}>
              <SelectTrigger id="filtro-tipo" className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <Label htmlFor="filtro-finalidade">Finalidade</Label>
            <Select
              value={filtros.finalidade}
              onValueChange={(v) => atualizarFiltro('finalidade', v as Filtros['finalidade'])}
            >
              <SelectTrigger id="filtro-finalidade" className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label htmlFor="filtro-local">Cidade ou bairro</Label>
            <Input
              id="filtro-local"
              value={filtros.local}
              onChange={(e) => atualizarFiltro('local', e.target.value)}
              placeholder="Ex.: Centro, Teresina"
            />
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <Label htmlFor="filtro-quartos">Quartos</Label>
            <Select
              value={filtros.quartosMin}
              onValueChange={(v) => atualizarFiltro('quartosMin', v)}
            >
              <SelectTrigger id="filtro-quartos" className="w-full">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <Label>Valor {filtros.finalidade === 'aluguel' ? '(mensal)' : ''}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label="Valor mínimo"
                value={filtros.valorMin}
                onChange={(e) => atualizarFiltro('valorMin', e.target.value)}
                placeholder="Mín."
              />
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                aria-label="Valor máximo"
                value={filtros.valorMax}
                onChange={(e) => atualizarFiltro('valorMax', e.target.value)}
                placeholder="Máx."
              />
            </div>
          </div>
        </div>

        {filtrosAtivos && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={limparFiltros}
          >
            <RotateCcw />
            Limpar filtros
          </Button>
        )}
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar os imóveis: {erro}
        </p>
      )}

      {carregando && !erro && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {!carregando && !erro && imoveis.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-14 text-center">
          <p className="font-medium">Nenhum imóvel encontrado com esses filtros.</p>
          <p className="text-sm text-muted-foreground">
            Tente ampliar a faixa de valor ou remover algum filtro.
          </p>
          {filtrosAtivos && (
            <Button type="button" variant="outline" size="sm" onClick={limparFiltros}>
              <RotateCcw />
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {!carregando && imoveis.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} corDestaque={branding.corPrimaria} />
            ))}
          </div>

          {temMais && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={carregandoMais}
                onClick={carregarMais}
              >
                {carregandoMais ? 'Carregando…' : 'Carregar mais'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
