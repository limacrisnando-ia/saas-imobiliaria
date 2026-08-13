import { useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { AdminNav } from '@/components/admin/AdminNav'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useBranding } from '@/hooks/use-branding'
import type { Branding } from '@/lib/branding'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

function MarcaImobiliaria({ branding, className }: { branding: Branding; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      {branding.logoUrl ? (
        <img src={branding.logoUrl} alt={branding.nome} className="size-7 object-contain" />
      ) : (
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
          style={{ backgroundColor: branding.corPrimaria }}
        >
          {branding.iniciais}
        </div>
      )}
      <span className="truncate font-medium">{branding.nome}</span>
    </div>
  )
}

export default function AdminLayout() {
  const { sair } = useAuth()
  const branding = useBranding()
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
        <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 gap-0 p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="sr-only">{branding.nome}</SheetTitle>
              <MarcaImobiliaria branding={branding} />
            </SheetHeader>
            <AdminNav className="px-2 py-4" aoNavegar={() => setMenuAberto(false)} />
          </SheetContent>
        </Sheet>

        <MarcaImobiliaria branding={branding} className="flex-1 md:flex-none" />

        <Button variant="outline" size="sm" className="ml-auto" onClick={sair}>
          <LogOut />
          Sair
        </Button>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border md:block">
          <AdminNav className="px-3 py-4" />
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
