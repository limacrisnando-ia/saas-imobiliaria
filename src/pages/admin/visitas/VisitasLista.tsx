import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase'

async function buscarVisitas() {
  return supabase
    .from('visitas')
    .select(
      'id, visitante_nome, visitante_contato, data_visita, responsavel, imoveis!visitas_imovel_id_fkey(titulo)'
    )
    .order('data_visita', { ascending: false })
}

type VisitaLinha = NonNullable<Awaited<ReturnType<typeof buscarVisitas>>['data']>[number]

function formatarData(data: string): string {
  // data_visita é `date` (YYYY-MM-DD); construir com partes evita o
  // deslocamento de fuso que `new Date('YYYY-MM-DD')` (UTC) causaria.
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export default function VisitasLista() {
  const [visitas, setVisitas] = useState<VisitaLinha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data, error } = await buscarVisitas()
    if (error) {
      setErro(error.message)
      return
    }
    setErro(null)
    setVisitas(data)
  }

  async function excluir(id: string, visitante: string) {
    if (!window.confirm(`Excluir o registro de visita de "${visitante}"?`)) return

    setExcluindo(id)
    const { error } = await supabase.from('visitas').delete().eq('id', id)
    setExcluindo(null)

    if (error) {
      window.alert(`Não foi possível excluir: ${error.message}`)
      return
    }
    setVisitas((atual) => atual?.filter((v) => v.id !== id) ?? null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Visitas</h1>
          <p className="text-sm text-muted-foreground">
            {visitas ? `${visitas.length} registrada(s)` : 'Carregando…'}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/visitas/nova">
            <Plus />
            Nova visita
          </Link>
        </Button>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          Falha ao carregar visitas: {erro}
        </p>
      )}

      {!erro && visitas?.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhuma visita registrada ainda.
        </p>
      )}

      {visitas && visitas.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Imóvel</TableHead>
              <TableHead>Visitante</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitas.map((visita) => (
              <TableRow key={visita.id}>
                <TableCell className="whitespace-nowrap">
                  {formatarData(visita.data_visita)}
                </TableCell>
                <TableCell className="max-w-56 truncate">
                  {visita.imoveis?.titulo ?? '—'}
                </TableCell>
                <TableCell className="font-medium">
                  <Link to={`/admin/visitas/${visita.id}/editar`} className="hover:underline">
                    {visita.visitante_nome}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {visita.visitante_contato ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {visita.responsavel ?? '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/visitas/${visita.id}/editar`}>Editar</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Excluir visita de ${visita.visitante_nome}`}
                      disabled={excluindo === visita.id}
                      onClick={() => excluir(visita.id, visita.visitante_nome)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
