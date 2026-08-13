import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { resolverBranding } from '@/lib/branding'
import type { Branding } from '@/lib/branding'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type BrandingContextValue = {
  /** Linha crua de `configuracoes`, para telas que precisam editar os campos originais. */
  config: Tables<'configuracoes'> | null
  branding: Branding
  carregando: boolean
  /** Refaz a busca — chame depois de salvar em Configurações para refletir sem reload. */
  recarregar: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Tables<'configuracoes'> | null>(null)
  const [carregando, setCarregando] = useState(true)

  const recarregar = useCallback(async () => {
    const { data } = await supabase.from('configuracoes').select('*').maybeSingle()
    setConfig(data)
    setCarregando(false)
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return (
    <BrandingContext.Provider
      value={{ config, branding: resolverBranding(config), carregando, recarregar }}
    >
      {children}
    </BrandingContext.Provider>
  )
}

export function useBrandingContext() {
  const ctx = useContext(BrandingContext)
  if (!ctx) throw new Error('useBrandingContext precisa estar dentro de <BrandingProvider>.')
  return ctx
}
