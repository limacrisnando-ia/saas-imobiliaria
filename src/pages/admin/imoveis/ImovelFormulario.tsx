import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ComodidadesEditor } from '@/components/admin/imoveis/ComodidadesEditor'
import { GaleriaImagens } from '@/components/admin/imoveis/GaleriaImagens'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  ROTULOS_FINALIDADE,
  ROTULOS_ORIGEM,
  ROTULOS_STATUS,
  ROTULOS_TIPO_COMISSAO,
} from '@/lib/imovel-labels'
import { supabase } from '@/lib/supabase'
import type { Enums, Tables, TablesInsert } from '@/types/database'

type Formulario = {
  titulo: string
  descricao: string
  tipo_id: string
  finalidade: Enums<'finalidade_imovel'> | ''
  valor_venda: string
  valor_aluguel: string
  taxas_adicionais: string
  aceita_permuta: boolean
  permuta_obs: string
  cidade: string
  bairro: string
  endereco: string
  quartos: string
  banheiros: string
  vagas: string
  area_construida: string
  area_total: string
  comodidades: string[]
  status: Enums<'status_imovel'>
  observacoes_documentacao: string
  documentacao_publica: boolean
  origem: Enums<'origem_imovel'>
  proprietario_nome: string
  proprietario_contato: string
  comissao_venda_tipo: Enums<'tipo_comissao'> | ''
  comissao_venda_valor: string
  comissao_aluguel_tipo: Enums<'tipo_comissao'> | ''
  comissao_aluguel_valor: string
  publicado: boolean
  destaque: boolean
}

const FORMULARIO_VAZIO: Formulario = {
  titulo: '',
  descricao: '',
  tipo_id: '',
  finalidade: '',
  valor_venda: '',
  valor_aluguel: '',
  taxas_adicionais: '',
  aceita_permuta: false,
  permuta_obs: '',
  cidade: '',
  bairro: '',
  endereco: '',
  quartos: '',
  banheiros: '',
  vagas: '',
  area_construida: '',
  area_total: '',
  comodidades: [],
  status: 'disponivel',
  observacoes_documentacao: '',
  documentacao_publica: false,
  origem: 'proprio',
  proprietario_nome: '',
  proprietario_contato: '',
  comissao_venda_tipo: '',
  comissao_venda_valor: '',
  comissao_aluguel_tipo: '',
  comissao_aluguel_valor: '',
  publicado: false,
  destaque: false,
}

function paraFormulario(imovel: Tables<'imoveis'>): Formulario {
  return {
    titulo: imovel.titulo,
    descricao: imovel.descricao ?? '',
    tipo_id: imovel.tipo_id,
    finalidade: imovel.finalidade,
    valor_venda: imovel.valor_venda?.toString() ?? '',
    valor_aluguel: imovel.valor_aluguel?.toString() ?? '',
    taxas_adicionais: imovel.taxas_adicionais ?? '',
    aceita_permuta: imovel.aceita_permuta,
    permuta_obs: imovel.permuta_obs ?? '',
    cidade: imovel.cidade ?? '',
    bairro: imovel.bairro ?? '',
    endereco: imovel.endereco ?? '',
    quartos: imovel.quartos?.toString() ?? '',
    banheiros: imovel.banheiros?.toString() ?? '',
    vagas: imovel.vagas?.toString() ?? '',
    area_construida: imovel.area_construida?.toString() ?? '',
    area_total: imovel.area_total?.toString() ?? '',
    comodidades: imovel.comodidades,
    status: imovel.status,
    observacoes_documentacao: imovel.observacoes_documentacao ?? '',
    documentacao_publica: imovel.documentacao_publica,
    origem: imovel.origem,
    proprietario_nome: imovel.proprietario_nome ?? '',
    proprietario_contato: imovel.proprietario_contato ?? '',
    comissao_venda_tipo: imovel.comissao_venda_tipo ?? '',
    comissao_venda_valor: imovel.comissao_venda_valor?.toString() ?? '',
    comissao_aluguel_tipo: imovel.comissao_aluguel_tipo ?? '',
    comissao_aluguel_valor: imovel.comissao_aluguel_valor?.toString() ?? '',
    publicado: imovel.publicado,
    destaque: imovel.destaque,
  }
}

function numeroOuNulo(valor: string): number | null {
  const limpo = valor.trim()
  if (limpo === '') return null
  const n = Number(limpo)
  return Number.isNaN(n) ? null : n
}

function paraPayload(f: Formulario): TablesInsert<'imoveis'> {
  return {
    titulo: f.titulo.trim(),
    descricao: f.descricao.trim() || null,
    tipo_id: f.tipo_id,
    finalidade: f.finalidade as Enums<'finalidade_imovel'>,
    valor_venda: f.finalidade === 'aluguel' ? null : numeroOuNulo(f.valor_venda),
    valor_aluguel: f.finalidade === 'venda' ? null : numeroOuNulo(f.valor_aluguel),
    taxas_adicionais: f.taxas_adicionais.trim() || null,
    aceita_permuta: f.aceita_permuta,
    permuta_obs: f.aceita_permuta ? f.permuta_obs.trim() || null : null,
    cidade: f.cidade.trim() || null,
    bairro: f.bairro.trim() || null,
    endereco: f.endereco.trim() || null,
    quartos: numeroOuNulo(f.quartos),
    banheiros: numeroOuNulo(f.banheiros),
    vagas: numeroOuNulo(f.vagas),
    area_construida: numeroOuNulo(f.area_construida),
    area_total: numeroOuNulo(f.area_total),
    comodidades: f.comodidades,
    status: f.status,
    observacoes_documentacao: f.observacoes_documentacao.trim() || null,
    documentacao_publica: f.documentacao_publica,
    origem: f.origem,
    proprietario_nome: f.origem === 'intermediacao' ? f.proprietario_nome.trim() || null : null,
    proprietario_contato:
      f.origem === 'intermediacao' ? f.proprietario_contato.trim() || null : null,
    comissao_venda_tipo:
      f.origem === 'intermediacao' ? (f.comissao_venda_tipo as Enums<'tipo_comissao'>) || null : null,
    comissao_venda_valor:
      f.origem === 'intermediacao' ? numeroOuNulo(f.comissao_venda_valor) : null,
    comissao_aluguel_tipo:
      f.origem === 'intermediacao'
        ? (f.comissao_aluguel_tipo as Enums<'tipo_comissao'>) || null
        : null,
    comissao_aluguel_valor:
      f.origem === 'intermediacao' ? numeroOuNulo(f.comissao_aluguel_valor) : null,
    publicado: f.publicado,
    destaque: f.destaque,
  }
}

export default function ImovelFormulario() {
  const { id } = useParams<{ id: string }>()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [tipos, setTipos] = useState<Tables<'tipos_imovel'>[]>([])
  const [form, setForm] = useState<Formulario>(FORMULARIO_VAZIO)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('tipos_imovel')
      .select('*')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => setTipos(data ?? []))
  }, [])

  useEffect(() => {
    if (!id) return
    let ativo = true

    supabase
      .from('imoveis')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!ativo) return
        if (error || !data) {
          setErro('Imóvel não encontrado.')
        } else {
          setForm(paraFormulario(data))
        }
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [id])

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)

    if (!form.tipo_id || !form.finalidade) {
      setErro('Preencha o tipo e a finalidade do imóvel.')
      return
    }

    setSalvando(true)
    const payload = paraPayload(form)

    const { error } = editando
      ? await supabase.from('imoveis').update(payload).eq('id', id!)
      : await supabase.from('imoveis').insert(payload)

    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }
    navigate('/admin/imoveis')
  }

  if (carregando) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium">{editando ? 'Editar imóvel' : 'Novo imóvel'}</h1>
        <p className="text-sm text-muted-foreground">
          {editando ? 'Altere os dados e salve.' : 'Preencha os dados do imóvel.'}
        </p>
      </div>

      <form onSubmit={aoSalvar} className="flex flex-col gap-8">
        {/* Bloco 1: dados públicos */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Dados do imóvel</h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              required
              value={form.titulo}
              onChange={(e) => atualizar('titulo', e.target.value)}
              placeholder="Ex.: Casa 3 quartos no Centro"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={form.tipo_id} onValueChange={(v) => atualizar('tipo_id', v)}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="finalidade">Finalidade</Label>
              <Select
                value={form.finalidade}
                onValueChange={(v) => atualizar('finalidade', v as Enums<'finalidade_imovel'>)}
              >
                <SelectTrigger id="finalidade" className="w-full">
                  <SelectValue placeholder="Selecione a finalidade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROTULOS_FINALIDADE).map(([valor, rotulo]) => (
                    <SelectItem key={valor} value={valor}>
                      {rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(form.finalidade === 'venda' || form.finalidade === 'ambos') && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="valor_venda">Valor de venda</Label>
              <Input
                id="valor_venda"
                type="number"
                min="0"
                step="0.01"
                value={form.valor_venda}
                onChange={(e) => atualizar('valor_venda', e.target.value)}
              />
            </div>
          )}

          {(form.finalidade === 'aluguel' || form.finalidade === 'ambos') && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="valor_aluguel">Valor de aluguel (mensal)</Label>
              <Input
                id="valor_aluguel"
                type="number"
                min="0"
                step="0.01"
                value={form.valor_aluguel}
                onChange={(e) => atualizar('valor_aluguel', e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="taxas">Taxas adicionais</Label>
            <Input
              id="taxas"
              value={form.taxas_adicionais}
              onChange={(e) => atualizar('taxas_adicionais', e.target.value)}
              placeholder="Ex.: condomínio R$ 300, IPTU incluso"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="aceita_permuta">Aceita permuta</Label>
              <p className="text-xs text-muted-foreground">Aceita negociação, carro etc.</p>
            </div>
            <Switch
              id="aceita_permuta"
              checked={form.aceita_permuta}
              onCheckedChange={(v) => atualizar('aceita_permuta', v)}
            />
          </div>

          {form.aceita_permuta && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="permuta_obs">Detalhe da permuta</Label>
              <Input
                id="permuta_obs"
                value={form.permuta_obs}
                onChange={(e) => atualizar('permuta_obs', e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={form.cidade}
                onChange={(e) => atualizar('cidade', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={form.bairro}
                onChange={(e) => atualizar('bairro', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={form.endereco}
                onChange={(e) => atualizar('endereco', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quartos">Quartos</Label>
              <Input
                id="quartos"
                type="number"
                min="0"
                value={form.quartos}
                onChange={(e) => atualizar('quartos', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="banheiros">Banheiros</Label>
              <Input
                id="banheiros"
                type="number"
                min="0"
                value={form.banheiros}
                onChange={(e) => atualizar('banheiros', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="vagas">Vagas</Label>
              <Input
                id="vagas"
                type="number"
                min="0"
                value={form.vagas}
                onChange={(e) => atualizar('vagas', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="area_construida">Área construída (m²)</Label>
              <Input
                id="area_construida"
                type="number"
                min="0"
                step="0.01"
                value={form.area_construida}
                onChange={(e) => atualizar('area_construida', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="area_total">Área total (m²)</Label>
              <Input
                id="area_total"
                type="number"
                min="0"
                step="0.01"
                value={form.area_total}
                onChange={(e) => atualizar('area_total', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Comodidades</Label>
            <ComodidadesEditor
              valor={form.comodidades}
              aoMudar={(v) => atualizar('comodidades', v)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => atualizar('status', v as Enums<'status_imovel'>)}
            >
              <SelectTrigger id="status" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
                  <SelectItem key={valor} value={valor}>
                    {rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={4}
              value={form.descricao}
              onChange={(e) => atualizar('descricao', e.target.value)}
            />
          </div>
        </section>

        {/* Fotos: só existem depois que o imóvel tem id */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Fotos</h2>
          {editando && id ? (
            <GaleriaImagens imovelId={id} />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Salve o imóvel primeiro para adicionar fotos.
            </p>
          )}
        </section>

        {/* Bloco 2: documentação — interno por padrão */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Documentação</h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="observacoes_documentacao">Observações de documentação</Label>
            <Textarea
              id="observacoes_documentacao"
              rows={3}
              value={form.observacoes_documentacao}
              onChange={(e) => atualizar('observacoes_documentacao', e.target.value)}
              placeholder="Ex.: escritura em retificação"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="documentacao_publica">Publicar esta observação no site</Label>
              <p className="text-xs text-muted-foreground">
                Desligado por padrão. Enquanto estiver desligado, a observação acima fica só no
                painel.
              </p>
            </div>
            <Switch
              id="documentacao_publica"
              checked={form.documentacao_publica}
              onCheckedChange={(v) => atualizar('documentacao_publica', v)}
            />
          </div>
        </section>

        {/* Bloco 2.5: origem e comissão — interno por padrão */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              Origem e comissão (interno)
            </h2>
            <p className="text-xs text-muted-foreground">
              Esta seção é só para uso interno da imobiliária — nunca aparece no site.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="origem">Origem do imóvel</Label>
            <Select
              value={form.origem}
              onValueChange={(v) => atualizar('origem', v as Enums<'origem_imovel'>)}
            >
              <SelectTrigger id="origem" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROTULOS_ORIGEM).map(([valor, rotulo]) => (
                  <SelectItem key={valor} value={valor}>
                    {rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.origem === 'intermediacao' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="proprietario_nome">Nome do proprietário</Label>
                  <Input
                    id="proprietario_nome"
                    value={form.proprietario_nome}
                    onChange={(e) => atualizar('proprietario_nome', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="proprietario_contato">Contato do proprietário</Label>
                  <Input
                    id="proprietario_contato"
                    value={form.proprietario_contato}
                    onChange={(e) => atualizar('proprietario_contato', e.target.value)}
                    placeholder="Telefone, WhatsApp etc."
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Comissão de venda</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="comissao_venda_tipo">Tipo</Label>
                    <Select
                      value={form.comissao_venda_tipo}
                      onValueChange={(v) =>
                        atualizar('comissao_venda_tipo', v as Enums<'tipo_comissao'>)
                      }
                    >
                      <SelectTrigger id="comissao_venda_tipo" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROTULOS_TIPO_COMISSAO).map(([valor, rotulo]) => (
                          <SelectItem key={valor} value={valor}>
                            {rotulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="comissao_venda_valor">Valor</Label>
                    <Input
                      id="comissao_venda_valor"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.comissao_venda_valor}
                      onChange={(e) => atualizar('comissao_venda_valor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Comissão de aluguel
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="comissao_aluguel_tipo">Tipo</Label>
                    <Select
                      value={form.comissao_aluguel_tipo}
                      onValueChange={(v) =>
                        atualizar('comissao_aluguel_tipo', v as Enums<'tipo_comissao'>)
                      }
                    >
                      <SelectTrigger id="comissao_aluguel_tipo" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROTULOS_TIPO_COMISSAO).map(([valor, rotulo]) => (
                          <SelectItem key={valor} value={valor}>
                            {rotulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="comissao_aluguel_valor">Valor</Label>
                    <Input
                      id="comissao_aluguel_valor"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.comissao_aluguel_valor}
                      onChange={(e) => atualizar('comissao_aluguel_valor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Bloco 3: controle */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Controle</h2>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="publicado">Publicado</Label>
              <p className="text-xs text-muted-foreground">
                Aparece no site quando ligado e o status for disponível ou reservado.
              </p>
            </div>
            <Switch
              id="publicado"
              checked={form.publicado}
              onCheckedChange={(v) => atualizar('publicado', v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="destaque">Destaque</Label>
              <p className="text-xs text-muted-foreground">Exibe este imóvel na home do site.</p>
            </div>
            <Switch
              id="destaque"
              checked={form.destaque}
              onCheckedChange={(v) => atualizar('destaque', v)}
            />
          </div>
        </section>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/imoveis">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
