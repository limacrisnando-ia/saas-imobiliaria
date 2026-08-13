import { supabase } from '@/lib/supabase'

export const BUCKET_IMAGENS = 'imoveis'

/** Mesmo limite do bucket — ver supabase/migrations/*_criar_bucket_imagens.sql. */
export const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024

/** Mesmos MIME types aceitos pelo bucket. */
const EXTENSAO_POR_TIPO: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
}

/** Valida no cliente antes de gastar uma chamada de upload. O bucket também recusa, mas aqui dá pra avisar com o nome do arquivo. */
export function validarArquivo(arquivo: File): string | null {
  if (!(arquivo.type in EXTENSAO_POR_TIPO)) {
    return `${arquivo.name}: formato não aceito (use JPEG, PNG, WEBP, AVIF ou SVG).`
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return `${arquivo.name}: maior que 5 MB.`
  }
  return null
}

export async function enviarImagem(
  imovelId: string,
  arquivo: File
): Promise<{ url: string; erro?: undefined } | { url?: undefined; erro: string }> {
  const extensao = EXTENSAO_POR_TIPO[arquivo.type] ?? 'jpg'
  const caminho = `${imovelId}/${crypto.randomUUID()}.${extensao}`

  const { error } = await supabase.storage.from(BUCKET_IMAGENS).upload(caminho, arquivo)
  if (error) return { erro: error.message }

  const { data } = supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho)
  return { url: data.publicUrl }
}

/** Recupera o caminho dentro do bucket a partir da URL pública salva em imovel_imagens.url. */
function caminhoDoStorage(url: string): string | null {
  const marcador = `/object/public/${BUCKET_IMAGENS}/`
  const indice = url.indexOf(marcador)
  if (indice === -1) return null
  return decodeURIComponent(url.slice(indice + marcador.length))
}

export async function removerImagemDoStorage(url: string): Promise<void> {
  const caminho = caminhoDoStorage(url)
  if (!caminho) return
  await supabase.storage.from(BUCKET_IMAGENS).remove([caminho])
}
