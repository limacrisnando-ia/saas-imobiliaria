import { useEffect, useState } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
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
import { CORES_STATUS, ROTULOS_FINALIDADE, ROTULOS_STATUS, formatarMoeda } from '@/lib/imovel-labels'
import { cn } from '@/lib/utils'

async function buscarImoveis() {
  return supabase
    .from('imoveis')
    .select(
      'id, titulo, finalidade, valor_venda, valor_aluguel, status, publicado, destaque, tipos_imovel(nome)'
    )
    .order('criado_em', { ascending: false })
}

type ImovelLinha = NonNullable<Awaited<ReturnType<typeof buscarImoveis>>['data']>[number]

export default function ImoveisLista() {
  const [imoveis, setImoveis] = useState<ImovelLinha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data, error } = await buscarImoveis()
    if (error) {
      setErro(error.message)
      return
    }
    setErro(null)
    setImoveis(data)
  }

  async function excluir(id: string, titulo: string) {
    if (!window.confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`)) return

    setExcluindo(id)
    const { error } = await supabase.from('imoveis').delete().eq('id', id)
    setExcluindo(null)

    if (error) {
      window.alert(`Não foi possível excluir: ${error.message}`)
      return
    }
    setImoveis((atual) => atual?.filter((i) => i.id !== id) ?? null)
  }

  function valorExibido(imovel: ImovelLinha): string {
    const partes: string[] = []
    if (imovel.finalidade !== 'aluguel' && imovel.valor_venda !== null) {
      partes.push(formatarMoeda(imovel.valor_venda)!)
    }
    if (imovel.finalidade !== 'venda' && imovel.valor_aluguel !== null) {
      partes.push(`${formatarMoeda(imovel.valor_aluguel)}/mês`)
    }
    return partes.length > 0 ? partes.join(' · ') : '—'
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            {imoveis ? `${imoveis.length} cadastrado(s)` : 'Carregando…'}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/imoveis/novo">
            <Plus />
            Novo imóvel
          </Link>
        </Button>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          Falha ao carregar imóveis: {erro}
        </p>
      )}

      {!erro && imoveis?.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhum imóvel cadastrado ainda.
        </p>
      )}

      {imoveis && imoveis.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Finalidade</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imoveis.map((imovel) => (
              <TableRow key={imovel.id}>
                <TableCell className="max-w-64 truncate font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {imovel.destaque && (
                      <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <Link to={`/admin/imoveis/${imovel.id}/editar`} className="hover:underline">
                      {imovel.titulo}
                    </Link>
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {imovel.tipos_imovel?.nome ?? '—'}
                </TableCell>
                <TableCell>{ROTULOS_FINALIDADE[imovel.finalidade]}</TableCell>
                <TableCell>{valorExibido(imovel)}</TableCell>
                <TableCell>
                  <Badge className={cn('border-transparent', CORES_STATUS[imovel.status])}>
                    {ROTULOS_STATUS[imovel.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {imovel.publicado ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Sim</span>
                  ) : (
                    <span className="text-muted-foreground">Não</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/imoveis/${imovel.id}/editar`}>Editar</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Excluir ${imovel.titulo}`}
                      disabled={excluindo === imovel.id}
                      onClick={() => excluir(imovel.id, imovel.titulo)}
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
