import type { Tables } from '@/types/database'

/**
 * A tabela `configuracoes` nasce com logo e cores nulos — o admin preenche pelo painel.
 * Estas funções garantem que a UI nunca receba `null` de branding.
 */

export const BRANDING_PADRAO = {
  corPrimaria: '#0F172A',
  corSecundaria: '#64748B',
} as const

export type Branding = {
  nome: string
  whatsapp: string | null
  instagram: string | null
  endereco: string | null
  logoUrl: string | null
  corPrimaria: string
  corSecundaria: string
  /** Iniciais do nome, usadas quando não há logo. Ex.: "Ribeiro Imobiliária" → "RI". */
  iniciais: string
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Usado tanto aqui quanto na validação do formulário de configurações. */
export function corHexValida(cor: string): boolean {
  return HEX.test(cor.trim())
}

/** Descarta valor vazio, só espaços ou hex inválido. */
function corValida(cor: string | null | undefined, padrao: string): string {
  const limpa = cor?.trim()
  return limpa && corHexValida(limpa) ? limpa : padrao
}

function vazioViraNulo(valor: string | null | undefined): string | null {
  const limpo = valor?.trim()
  return limpo ? limpo : null
}

function iniciaisDe(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return '?'
  return palavras
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

/**
 * Normaliza a linha de `configuracoes` para uso na UI. Aceita `null` — se a
 * consulta falhar ou a linha ainda não existir, o site continua renderizando.
 */
export function resolverBranding(
  config: Tables<'configuracoes'> | null | undefined
): Branding {
  const nome = vazioViraNulo(config?.nome) ?? 'Imobiliária'

  return {
    nome,
    whatsapp: vazioViraNulo(config?.whatsapp),
    instagram: vazioViraNulo(config?.instagram),
    endereco: vazioViraNulo(config?.endereco),
    logoUrl: vazioViraNulo(config?.logo_url),
    corPrimaria: corValida(config?.cor_primaria, BRANDING_PADRAO.corPrimaria),
    corSecundaria: corValida(config?.cor_secundaria, BRANDING_PADRAO.corSecundaria),
    iniciais: iniciaisDe(nome),
  }
}

/** Só dígitos, no formato que o wa.me espera (com DDI 55). */
export function linkWhatsApp(whatsapp: string | null): string | null {
  if (!whatsapp) return null
  const digitos = whatsapp.replace(/\D/g, '')
  if (digitos.length < 10) return null
  return `https://wa.me/${digitos.startsWith('55') ? digitos : `55${digitos}`}`
}
