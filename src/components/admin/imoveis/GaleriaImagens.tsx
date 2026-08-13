import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { enviarImagem, removerImagemDoStorage, validarArquivo } from '@/lib/storage-imagens'
import type { Tables } from '@/types/database'

type Imagem = Tables<'imovel_imagens'>

async function buscarImagens(imovelId: string) {
  return supabase
    .from('imovel_imagens')
    .select('*')
    .eq('imovel_id', imovelId)
    .order('ordem', { ascending: true })
}

export function GaleriaImagens({ imovelId }: { imovelId: string }) {
  const [imagens, setImagens] = useState<Imagem[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState<{ atual: number; total: number } | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const carregar = useCallback(async () => {
    const { data, error } = await buscarImagens(imovelId)
    if (error) {
      setErro(error.message)
      return
    }
    setErro(null)
    setImagens(data)
  }, [imovelId])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function aoSelecionarArquivos(evento: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? [])
    evento.target.value = ''
    if (arquivos.length === 0) return

    const erros: string[] = []
    const validos: File[] = []
    for (const arquivo of arquivos) {
      const problema = validarArquivo(arquivo)
      if (problema) erros.push(problema)
      else validos.push(arquivo)
    }

    const jaTemCapa = imagens?.some((i) => i.capa) ?? false
    let proximaOrdem = imagens && imagens.length > 0 ? Math.max(...imagens.map((i) => i.ordem)) + 1 : 0

    setEnviando({ atual: 0, total: validos.length })

    for (let indice = 0; indice < validos.length; indice++) {
      const arquivo = validos[indice]!
      setEnviando({ atual: indice + 1, total: validos.length })

      const resultado = await enviarImagem(imovelId, arquivo)
      if (resultado.erro) {
        erros.push(`${arquivo.name}: ${resultado.erro}`)
        continue
      }

      const { error } = await supabase.from('imovel_imagens').insert({
        imovel_id: imovelId,
        url: resultado.url,
        ordem: proximaOrdem++,
        capa: !jaTemCapa && indice === 0,
      })
      if (error) erros.push(`${arquivo.name}: ${error.message}`)
    }

    setEnviando(null)
    setErro(erros.length > 0 ? erros.join(' ') : null)
    await carregar()
  }

  async function excluir(imagem: Imagem) {
    if (!window.confirm('Excluir esta foto?')) return
    setProcessando(imagem.id)

    const { error } = await supabase.from('imovel_imagens').delete().eq('id', imagem.id)
    if (error) {
      setErro(error.message)
      setProcessando(null)
      return
    }
    await removerImagemDoStorage(imagem.url)

    // Sem capa não fica sem imagem principal: promove a próxima na ordem.
    if (imagem.capa) {
      const restantes = (imagens ?? []).filter((i) => i.id !== imagem.id)
      const proxima = restantes.sort((a, b) => a.ordem - b.ordem)[0]
      if (proxima) {
        await supabase.from('imovel_imagens').update({ capa: true }).eq('id', proxima.id)
      }
    }

    setProcessando(null)
    await carregar()
  }

  async function definirCapa(imagem: Imagem) {
    setProcessando(imagem.id)
    // Ordem importa: desliga a capa atual antes de ligar a nova, por causa do
    // índice único parcial em imovel_imagens (imovel_id) where capa.
    await supabase.from('imovel_imagens').update({ capa: false }).eq('imovel_id', imovelId).eq('capa', true)
    const { error } = await supabase.from('imovel_imagens').update({ capa: true }).eq('id', imagem.id)
    if (error) setErro(error.message)
    setProcessando(null)
    await carregar()
  }

  async function mover(indice: number, direcao: -1 | 1) {
    if (!imagens) return
    const vizinho = imagens[indice + direcao]
    const atual = imagens[indice]
    if (!vizinho || !atual) return

    setProcessando(atual.id)
    await Promise.all([
      supabase.from('imovel_imagens').update({ ordem: vizinho.ordem }).eq('id', atual.id),
      supabase.from('imovel_imagens').update({ ordem: atual.ordem }).eq('id', vizinho.id),
    ])
    setProcessando(null)
    await carregar()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WEBP, AVIF ou SVG · até 5 MB cada
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={enviando !== null}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {enviando ? `Enviando ${enviando.atual} de ${enviando.total}…` : 'Adicionar fotos'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
          multiple
          hidden
          onChange={aoSelecionarArquivos}
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      {imagens && imagens.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhuma foto ainda.
        </p>
      )}

      {imagens && imagens.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {imagens.map((imagem, indice) => (
            <div key={imagem.id} className="flex flex-col gap-1">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={imagem.url}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
                {imagem.capa && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    Capa
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-0.5">
                <div className="flex gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Mover para trás"
                    disabled={indice === 0 || processando !== null}
                    onClick={() => mover(indice, -1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Mover para frente"
                    disabled={indice === imagens.length - 1 || processando !== null}
                    onClick={() => mover(indice, 1)}
                  >
                    <ArrowRight />
                  </Button>
                </div>
                <div className="flex gap-0.5">
                  {!imagem.capa && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Definir como capa"
                      disabled={processando !== null}
                      onClick={() => definirCapa(imagem)}
                    >
                      <Star />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Excluir foto"
                    disabled={processando !== null}
                    onClick={() => excluir(imagem)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
