import { useEffect, useState } from 'react'

import { resolverBranding } from '@/lib/branding'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

/** Busca a linha singleton de `configuracoes` e resolve com fallback pronto para a UI. */
export function useBranding() {
  const [config, setConfig] = useState<Tables<'configuracoes'> | null>(null)

  useEffect(() => {
    let ativo = true
    supabase
      .from('configuracoes')
      .select('*')
      .maybeSingle()
      .then(({ data }) => {
        if (ativo) setConfig(data)
      })
    return () => {
      ativo = false
    }
  }, [])

  return resolverBranding(config)
}
