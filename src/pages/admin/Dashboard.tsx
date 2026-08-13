import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

type Contagens = {
  imoveis: number
  tipos: number
  imagens: number
  visitas: number
}

export default function Dashboard() {
  const { session, sair } = useAuth()
  const [contagens, setContagens] = useState<Contagens | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  // Leitura autenticada real: `visitas` e `imoveis` são invisíveis ao anon,
  // então se estes números aparecem, a sessão está valendo no PostgREST.
  useEffect(() => {
    async function carregar() {
      const [imoveis, tipos, imagens, visitas] = await Promise.all([
        supabase.from('imoveis').select('*', { count: 'exact', head: true }),
        supabase.from('tipos_imovel').select('*', { count: 'exact', head: true }),
        supabase.from('imovel_imagens').select('*', { count: 'exact', head: true }),
        supabase.from('visitas').select('*', { count: 'exact', head: true }),
      ])

      const falha = [imoveis, tipos, imagens, visitas].find((r) => r.error)
      if (falha?.error) {
        setErro(falha.error.message)
        return
      }

      setContagens({
        imoveis: imoveis.count ?? 0,
        tipos: tipos.count ?? 0,
        imagens: imagens.count ?? 0,
        visitas: visitas.count ?? 0,
      })
    }

    carregar()
  }, [])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Painel administrativo</h1>
          <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        </div>
        <Button variant="outline" onClick={sair}>
          Sair
        </Button>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Acesso autenticado ao banco
        </h2>

        {erro ? (
          <p role="alert" className="text-sm text-destructive">
            Falha ao ler o banco: {erro}
          </p>
        ) : !contagens ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Imóveis', contagens.imoveis],
              ['Tipos', contagens.tipos],
              ['Imagens', contagens.imagens],
              ['Visitas', contagens.visitas],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="rounded-lg border border-border px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">{rotulo}</dt>
                <dd className="text-xl font-medium tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  )
}
