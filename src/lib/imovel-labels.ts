import type { Enums } from '@/types/database'

export const ROTULOS_FINALIDADE: Record<Enums<'finalidade_imovel'>, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  ambos: 'Venda ou aluguel',
}

export const ROTULOS_STATUS: Record<Enums<'status_imovel'>, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
}

/** Regra do CLAUDE.md: disponivel → verde · reservado → âmbar · vendido/alugado → cinza. */
export const CORES_STATUS: Record<Enums<'status_imovel'>, string> = {
  disponivel: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  reservado: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  vendido: 'bg-muted text-muted-foreground',
  alugado: 'bg-muted text-muted-foreground',
}

export function formatarMoeda(valor: number | null): string | null {
  if (valor === null) return null
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
