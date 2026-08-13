import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

/**
 * Lista livre de comodidades (mobiliado, condomínio fechado, etc.) — cresce sem
 * mudar o schema, conforme docs/MODELAGEM.md. Enter ou vírgula adiciona um item.
 */
export function ComodidadesEditor({
  valor,
  aoMudar,
}: {
  valor: string[]
  aoMudar: (novoValor: string[]) => void
}) {
  const [rascunho, setRascunho] = useState('')

  function adicionar() {
    const item = rascunho.trim()
    if (item && !valor.includes(item)) aoMudar([...valor, item])
    setRascunho('')
  }

  function remover(item: string) {
    aoMudar(valor.filter((v) => v !== item))
  }

  function aoPressionarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter' || evento.key === ',') {
      evento.preventDefault()
      adicionar()
    } else if (evento.key === 'Backspace' && rascunho === '' && valor.length > 0) {
      remover(valor[valor.length - 1]!)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        onKeyDown={aoPressionarTecla}
        onBlur={adicionar}
        placeholder="Digite e pressione Enter (ex.: mobiliado)"
      />
      {valor.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {valor.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => remover(item)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remover ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
