import { AtSign, MapPin, MessageCircle } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { useBranding } from '@/hooks/use-branding'
import { linkWhatsApp } from '@/lib/branding'

function linkInstagram(instagram: string | null): string | null {
  if (!instagram) return null
  return `https://instagram.com/${instagram.replace(/^@/, '')}`
}

export default function PublicLayout() {
  const branding = useBranding()
  const linkWhats = linkWhatsApp(branding.whatsapp)
  const linkInsta = linkInstagram(branding.instagram)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.nome}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: branding.corPrimaria }}
              >
                {branding.iniciais}
              </div>
            )}
            <span className="truncate text-base font-medium">{branding.nome}</span>
          </Link>

          <Link to="/imoveis" className="ml-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            Imóveis
          </Link>

          {linkWhats && (
            <a
              href={linkWhats}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: branding.corPrimaria }}
            >
              <MessageCircle className="size-4" />
              <span className="hidden sm:inline">Fale no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <div className="flex items-center gap-2 font-medium text-foreground">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="" className="h-6 w-auto object-contain" />
            )}
            {branding.nome}
          </div>

          {branding.endereco && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {branding.endereco}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {linkInsta && (
              <a
                href={linkInsta}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <AtSign className="size-4" />
                {branding.instagram}
              </a>
            )}
            {linkWhats && (
              <a
                href={linkWhats}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            )}
          </div>

          <p className="text-xs">
            © {new Date().getFullYear()} {branding.nome}
          </p>
        </div>
      </footer>
    </div>
  )
}
