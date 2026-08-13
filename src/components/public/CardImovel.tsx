import { Bath, Bed, Car, MapPin, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ROTULOS_FINALIDADE, valorExibido } from '@/lib/imovel-labels'
import type { Tables } from '@/types/database'

type ImovelComCapa = Tables<'imoveis_publicos'> & { capaUrl: string | null }

export function CardImovel({
  imovel,
  corDestaque,
}: {
  imovel: ImovelComCapa
  corDestaque: string
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-video w-full bg-muted">
        {imovel.capaUrl ? (
          <img
            src={imovel.capaUrl}
            alt={imovel.titulo ?? ''}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sem foto
          </div>
        )}
        {imovel.destaque && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-white">
            <Star className="size-3 fill-white" />
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {imovel.tipo_nome && <Badge variant="secondary">{imovel.tipo_nome}</Badge>}
          {imovel.finalidade && <Badge variant="outline">{ROTULOS_FINALIDADE[imovel.finalidade]}</Badge>}
        </div>

        <h3 className="font-medium">{imovel.titulo}</h3>

        {(imovel.bairro || imovel.cidade) && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex gap-3 text-xs text-muted-foreground">
          {imovel.quartos !== null && (
            <span className="inline-flex items-center gap-1">
              <Bed className="size-3.5" />
              {imovel.quartos}
            </span>
          )}
          {imovel.banheiros !== null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="size-3.5" />
              {imovel.banheiros}
            </span>
          )}
          {imovel.vagas !== null && (
            <span className="inline-flex items-center gap-1">
              <Car className="size-3.5" />
              {imovel.vagas}
            </span>
          )}
        </div>

        <p className="mt-auto pt-2 font-medium" style={{ color: corDestaque }}>
          {valorExibido(imovel, 'Consulte-nos')}
        </p>
      </div>
    </article>
  )
}
