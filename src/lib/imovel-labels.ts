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

type ImovelComValor = {
  finalidade: Enums<'finalidade_imovel'> | null
  valor_venda: number | null
  valor_aluguel: number | null
}

/** Mostra só o valor que faz sentido para a finalidade (regra usada no painel e no site público). */
export function valorExibido(imovel: ImovelComValor, textoVazio = '—'): string {
  const partes: string[] = []
  if (imovel.finalidade !== 'aluguel' && imovel.valor_venda !== null) {
    partes.push(formatarMoeda(imovel.valor_venda)!)
  }
  if (imovel.finalidade !== 'venda' && imovel.valor_aluguel !== null) {
    partes.push(`${formatarMoeda(imovel.valor_aluguel)}/mês`)
  }
  return partes.length > 0 ? partes.join(' · ') : textoVazio
}
