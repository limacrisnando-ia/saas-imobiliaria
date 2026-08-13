import { Building2, ClipboardList, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ItemNav = {
  to: string
  rotulo: string
  icone: LucideIcon
}

export const ITENS_NAV: ItemNav[] = [
  { to: '/admin/imoveis', rotulo: 'Imóveis', icone: Building2 },
  { to: '/admin/visitas', rotulo: 'Visitas', icone: ClipboardList },
  { to: '/admin/configuracoes', rotulo: 'Configurações', icone: Settings },
]
