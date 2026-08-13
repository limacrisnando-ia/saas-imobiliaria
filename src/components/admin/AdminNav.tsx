import { NavLink } from 'react-router-dom'

import { ITENS_NAV } from '@/components/admin/nav-items'
import { cn } from '@/lib/utils'

export function AdminNav({
  className,
  aoNavegar,
}: {
  className?: string
  /** Fecha o menu no mobile depois de escolher um item. */
  aoNavegar?: () => void
}) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {ITENS_NAV.map(({ to, rotulo, icone: Icone }) => (
        <NavLink
          key={to}
          to={to}
          onClick={aoNavegar}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'bg-muted text-foreground'
            )
          }
        >
          <Icone className="size-4 shrink-0" />
          {rotulo}
        </NavLink>
      ))}
    </nav>
  )
}
