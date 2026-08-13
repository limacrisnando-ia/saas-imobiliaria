/**
 * URL amigável tipo `/imoveis/casa-3-quartos-no-centro-<uuid>`. Não exige coluna
 * nova no banco: o slug é só decoração, a busca sempre usa o uuid embutido no
 * fim do parâmetro — então um link antigo com o título editado continua válido.
 */

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

const ACENTOS: Record<string, string> = {
  a: 'áàâã',
  e: 'éèê',
  i: 'íìî',
  o: 'óòôõ',
  u: 'úùû',
  c: 'ç',
}

function removerAcentos(texto: string): string {
  let resultado = texto
  for (const [sem, comAcento] of Object.entries(ACENTOS)) {
    for (const letra of comAcento) {
      resultado = resultado.split(letra).join(sem)
    }
  }
  return resultado
}

function slugificar(texto: string): string {
  return removerAcentos(texto.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugImovel(id: string, titulo: string): string {
  const base = slugificar(titulo)
  return base ? `${base}-${id}` : id
}

export function idDoSlug(param: string): string | null {
  return param.match(UUID)?.[0] ?? null
}
