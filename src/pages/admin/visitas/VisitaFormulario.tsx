import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/database'

type Formulario = {
  imovel_id: string
  visitante_nome: string
  visitante_contato: string
  data_visita: string
  responsavel: string
  observacoes: string
}

function hojeISO(): string {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formularioVazio(): Formulario {
  return {
    imovel_id: '',
    visitante_nome: '',
    visitante_contato: '',
    data_visita: hojeISO(),
    responsavel: '',
    observacoes: '',
  }
}

function paraFormulario(visita: Tables<'visitas'>): Formulario {
  return {
    imovel_id: visita.imovel_id,
    visitante_nome: visita.visitante_nome,
    visitante_contato: visita.visitante_contato ?? '',
    data_visita: visita.data_visita,
    responsavel: visita.responsavel ?? '',
    observacoes: visita.observacoes ?? '',
  }
}

function paraPayload(f: Formulario): TablesInsert<'visitas'> {
  return {
    imovel_id: f.imovel_id,
    visitante_nome: f.visitante_nome.trim(),
    visitante_contato: f.visitante_contato.trim() || null,
    data_visita: f.data_visita,
    responsavel: f.responsavel.trim() || null,
    observacoes: f.observacoes.trim() || null,
  }
}

export default function VisitaFormulario() {
  const { id } = useParams<{ id: string }>()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [imoveis, setImoveis] = useState<Pick<Tables<'imoveis'>, 'id' | 'titulo'>[]>([])
  const [form, setForm] = useState<Formulario>(formularioVazio)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('imoveis')
      .select('id, titulo')
      .order('titulo')
      .then(({ data }) => setImoveis(data ?? []))
  }, [])

  useEffect(() => {
    if (!id) return
    let ativo = true

    supabase
      .from('visitas')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!ativo) return
        if (error || !data) {
          setErro('Visita não encontrada.')
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

    if (!form.imovel_id) {
      setErro('Selecione o imóvel visitado.')
      return
    }

    setSalvando(true)
    const payload = paraPayload(form)

    const { error } = editando
      ? await supabase.from('visitas').update(payload).eq('id', id!)
      : await supabase.from('visitas').insert(payload)

    setSalvando(false)

    if (error) {
      setErro(error.message)
      return
    }
    navigate('/admin/visitas')
  }

  if (carregando) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium">{editando ? 'Editar visita' : 'Nova visita'}</h1>
        <p className="text-sm text-muted-foreground">
          Registro interno de uma visita já ocorrida — não é agendamento.
        </p>
      </div>

      <form onSubmit={aoSalvar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="imovel">Imóvel</Label>
          <Select value={form.imovel_id} onValueChange={(v) => atualizar('imovel_id', v)}>
            <SelectTrigger id="imovel" className="w-full">
              <SelectValue placeholder="Selecione o imóvel" />
            </SelectTrigger>
            <SelectContent>
              {imoveis.map((imovel) => (
                <SelectItem key={imovel.id} value={imovel.id}>
                  {imovel.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="visitante_nome">Visitante</Label>
            <Input
              id="visitante_nome"
              required
              value={form.visitante_nome}
              onChange={(e) => atualizar('visitante_nome', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="visitante_contato">Contato</Label>
            <Input
              id="visitante_contato"
              value={form.visitante_contato}
              onChange={(e) => atualizar('visitante_contato', e.target.value)}
              placeholder="Telefone ou e-mail"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="data_visita">Data da visita</Label>
            <Input
              id="data_visita"
              type="date"
              required
              value={form.data_visita}
              onChange={(e) => atualizar('data_visita', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={form.responsavel}
              onChange={(e) => atualizar('responsavel', e.target.value)}
              placeholder="Quem atendeu"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            rows={4}
            value={form.observacoes}
            onChange={(e) => atualizar('observacoes', e.target.value)}
          />
        </div>

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
            <Link to="/admin/visitas">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
