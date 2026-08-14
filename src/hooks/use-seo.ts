import { useEffect } from 'react'

type Seo = {
  title: string
  description: string
  /** URL absoluta da imagem (og:image precisa ser absoluto, não relativo). */
  image?: string
  /** 'website' para páginas gerais, 'article' faz sentido pro imóvel individual. */
  type?: 'website' | 'article'
}

function upsertMeta(seletor: string, atributo: 'name' | 'property', valor: string, conteudo: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(seletor)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(atributo, valor)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', conteudo)
}

/**
 * Define title + meta description + Open Graph/Twitter Card da página atual.
 *
 * LIMITE IMPORTANTE (SPA sem SSR): isso roda no navegador, depois do React
 * montar. Buscadores que executam JavaScript (Googlebot) veem essas tags
 * normalmente. Mas bots de pré-visualização de link (WhatsApp, Telegram,
 * Facebook) geralmente NÃO executam JS — eles leem só o HTML bruto de
 * index.html. Por isso, o card que aparece ao colar um link de imóvel no
 * WhatsApp mostra o título/imagem padrão do site (definidos em index.html),
 * não os deste hook. Resolver isso de verdade exige pré-renderizar ou servir
 * essas tags no edge (ex.: uma Cloudflare Pages Function) — fora do escopo
 * combinado aqui, que é manter o site 100% estático.
 */
export function useSeo({ title, description, image, type = 'website' }: Seo) {
  useEffect(() => {
    const tituloAnterior = document.title
    document.title = title

    upsertMeta('meta[name="description"]', 'name', 'description', description)

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href)
    if (image) upsertMeta('meta[property="og:image"]', 'property', 'og:image', image)

    upsertMeta(
      'meta[name="twitter:card"]',
      'name',
      'twitter:card',
      image ? 'summary_large_image' : 'summary'
    )
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    if (image) upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)

    return () => {
      document.title = tituloAnterior
    }
  }, [title, description, image, type])
}
