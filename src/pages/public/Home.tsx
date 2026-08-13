import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CardImovel } from '@/components/public/CardImovel'
import { useBranding } from '@/hooks/use-branding'
import { linkWhatsApp } from '@/lib/branding'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

type ImovelDestaque = Tables<'imoveis_publicos'> & { capaUrl: string | null }

async function buscarDestaques(): Promise<{ dados: ImovelDestaque[]; erro: string | null }> {
  // Site público: só a view imoveis_publicos, nunca a tabela imoveis.
  const { data: imoveis, error } = await supabase
    .from('imoveis_publicos')
    .select('*')
    .eq('destaque', true)
    .order('criado_em', { ascending: false })
    .limit(6)

  if (error) return { dados: [], erro: error.message }
  if (!imoveis || imoveis.length === 0) return { dados: [], erro: null }

  const ids = imoveis.map((i) => i.id).filter((id): id is string => id !== null)
  const { data: imagens } = await supabase
    .from('imovel_imagens')
    .select('imovel_id, url')
    .in('imovel_id', ids)
    .eq('capa', true)

  const capaPorImovel = new Map(imagens?.map((img) => [img.imovel_id, img.url]))

  return {
    dados: imoveis.map((imovel) => ({
      ...imovel,
      capaUrl: capaPorImovel.get(imovel.id!) ?? null,
    })),
    erro: null,
  }
}

export default function Home() {
  const branding = useBranding()
  const linkWhats = linkWhatsApp(branding.whatsapp)
  const [destaques, setDestaques] = useState<ImovelDestaque[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    buscarDestaques().then(({ dados, erro }) => {
      setDestaques(dados)
      setErro(erro)
    })
  }, [])

  return (
    <div className="flex flex-col">
      <section
        className="px-4 py-16 text-center text-white sm:px-6 sm:py-24"
        style={{ backgroundColor: branding.corPrimaria }}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Encontre seu próximo imóvel com a {branding.nome}
          </h1>
          <p className="text-white/80 sm:text-lg">
            Casas, apartamentos e terrenos selecionados para comprar ou alugar.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/imoveis"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/90"
            >
              Ver todos os imóveis
            </Link>
            {linkWhats && (
              <a
                href={linkWhats}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                <MessageCircle className="size-4" />
                Falar com um corretor
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-medium sm:text-2xl">Imóveis em destaque</h2>
          {destaques && destaques.length > 0 && (
            <Link to="/imoveis" className="text-sm font-medium hover:underline">
              Ver todos →
            </Link>
          )}
        </div>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os imóveis: {erro}
          </p>
        )}

        {destaques === null && !erro && (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        )}

        {!erro && destaques?.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Em breve, novidades por aqui.
          </p>
        )}

        {destaques && destaques.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((imovel) => (
              <CardImovel key={imovel.id} imovel={imovel} corDestaque={branding.corPrimaria} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
