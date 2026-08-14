/**
 * Gera dist/sitemap.xml depois do build, com as páginas estáticas + uma
 * entrada por imóvel publicado. Roda como um script Node comum (Node 24+
 * executa .ts nativamente) — não passa pelo Vite, por isso importa
 * src/lib/slug.ts por caminho relativo em vez do alias "@/".
 *
 * LIMITAÇÃO: o sitemap só é atualizado a cada build/deploy, não em tempo
 * real. Um imóvel cadastrado no painel só entra nele no próximo `npm run
 * build` (ou próximo deploy automático do Cloudflare Pages a partir de um
 * push). Para um catálogo pequeno, atualizado de vez em quando, isso é
 * aceitável; se o ritmo de cadastro aumentar, o próximo passo seria uma
 * Cloudflare Pages Function servindo /sitemap.xml sob demanda.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

import { slugImovel } from '../src/lib/slug.ts'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SITE_URL = (process.env.VITE_SITE_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

if (!process.env.VITE_SITE_URL) {
  console.warn(
    '[sitemap] VITE_SITE_URL não definido — usando http://localhost:5173 como placeholder. ' +
      'Defina VITE_SITE_URL com o domínio real (Cloudflare Pages ou domínio próprio) antes de publicar.'
  )
}

async function buscarImoveis(): Promise<{ id: string; titulo: string; atualizado_em: string | null }[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes — sitemap só com páginas estáticas.')
    return []
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase
    .from('imoveis_publicos')
    .select('id, titulo, atualizado_em')
    .order('criado_em', { ascending: false })

  if (error) {
    console.warn('[sitemap] Falha ao buscar imóveis:', error.message)
    return []
  }

  return (data ?? [])
    .filter((i): i is { id: string; titulo: string; atualizado_em: string | null } => i.id !== null && i.titulo !== null)
}

function entrada(loc: string, lastmod: string | null, changefreq: string, prioridade: string): string {
  const linhaLastmod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  return `  <url>\n    <loc>${loc}</loc>${linhaLastmod}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${prioridade}</priority>\n  </url>`
}

const imoveis = await buscarImoveis()
const hoje = new Date().toISOString().slice(0, 10)

const entradas = [
  entrada(`${SITE_URL}/`, hoje, 'daily', '1.0'),
  entrada(`${SITE_URL}/imoveis`, hoje, 'daily', '0.9'),
  ...imoveis.map((imovel) =>
    entrada(
      `${SITE_URL}/imoveis/${slugImovel(imovel.id, imovel.titulo)}`,
      imovel.atualizado_em?.slice(0, 10) ?? null,
      'weekly',
      '0.8'
    )
  ),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas.join('\n')}\n</urlset>\n`

mkdirSync('dist', { recursive: true })
writeFileSync('dist/sitemap.xml', xml)

console.log(`[sitemap] dist/sitemap.xml gerado: 2 páginas estáticas + ${imoveis.length} imóvel(is).`)
