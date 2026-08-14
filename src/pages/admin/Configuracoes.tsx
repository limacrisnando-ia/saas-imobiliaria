import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { CheckCircle2, MessageCircle, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBrandingContext } from '@/lib/branding-context'
import { corHexValida, linkWhatsApp, resolverBranding } from '@/lib/branding'
import { enviarImagem, removerImagemDoStorage, validarArquivo } from '@/lib/storage-imagens'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/database'

type Formulario = {
  nome: string
  whatsapp: string
  instagram: string
  endereco: string
  logo_url: string
  cor_primaria: string
  cor_secundaria: string
}

function paraFormulario(config: Tables<'configuracoes'> | null): Formulario {
  return {
    nome: config?.nome ?? '',
    whatsapp: config?.whatsapp ?? '',
    instagram: config?.instagram ?? '',
    endereco: config?.endereco ?? '',
    logo_url: config?.logo_url ?? '',
    cor_primaria: config?.cor_primaria ?? '',
    cor_secundaria: config?.cor_secundaria ?? '',
  }
}

function paraPayload(f: Formulario): TablesInsert<'configuracoes'> {
  return {
    nome: f.nome.trim(),
    whatsapp: f.whatsapp.trim() || null,
    instagram: f.instagram.trim() || null,
    endereco: f.endereco.trim() || null,
    logo_url: f.logo_url || null,
    cor_primaria: f.cor_primaria || null,
    cor_secundaria: f.cor_secundaria || null,
  }
}

export default function Configuracoes() {
  const { config, carregando, recarregar } = useBrandingContext()

  const [form, setForm] = useState<Formulario>(paraFormulario(null))
  const [inicializado, setInicializado] = useState(false)
  const [logoOriginal, setLogoOriginal] = useState<string | null>(null)
  const [enviandoLogo, setEnviandoLogo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const inputLogoRef = useRef<HTMLInputElement>(null)

  // Semeia o formulário só na primeira carga — depois disso o form é a fonte
  // da verdade até o usuário salvar (recarregar() não deve sobrescrever edições em curso).
  useEffect(() => {
    if (!carregando && !inicializado) {
      setForm(paraFormulario(config))
      setLogoOriginal(config?.logo_url ?? null)
      setInicializado(true)
    }
  }, [carregando, inicializado, config])

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setSucesso(false)
  }

  async function aoSelecionarLogo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return

    const problema = validarArquivo(arquivo)
    if (problema) {
      setErro(problema)
      return
    }

    setEnviandoLogo(true)
    const resultado = await enviarImagem('configuracoes', arquivo)
    setEnviandoLogo(false)

    if (!resultado.sucesso) {
      setErro(resultado.erro)
      return
    }
    setErro(null)
    atualizar('logo_url', resultado.url)
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setSucesso(false)

    if (!form.nome.trim()) {
      setErro('Informe o nome da imobiliária.')
      return
    }
    if (form.cor_primaria && !corHexValida(form.cor_primaria)) {
      setErro('Cor primária inválida — use um hex como #0F172A.')
      return
    }
    if (form.cor_secundaria && !corHexValida(form.cor_secundaria)) {
      setErro('Cor secundária inválida — use um hex como #64748B.')
      return
    }

    setSalvando(true)
    const payload = paraPayload(form)

    // Upsert manual: o singleton é garantido por um índice único em ((true)),
    // não por uma coluna — o .upsert() do PostgREST exige uma coluna real como
    // alvo de conflito, então busca-e-decide é o caminho correto aqui.
    const { error } = config
      ? await supabase.from('configuracoes').update(payload).eq('id', config.id)
      : await supabase.from('configuracoes').insert(payload)

    if (error) {
      setErro(error.message)
      setSalvando(false)
      return
    }

    if (logoOriginal && logoOriginal !== form.logo_url) {
      await removerImagemDoStorage(logoOriginal)
    }

    await recarregar()
    setLogoOriginal(form.logo_url || null)
    setSalvando(false)
    setSucesso(true)
  }

  const previa = resolverBranding({
    id: config?.id ?? '',
    nome: form.nome,
    whatsapp: form.whatsapp,
    instagram: form.instagram,
    endereco: form.endereco,
    logo_url: form.logo_url,
    cor_primaria: form.cor_primaria,
    cor_secundaria: form.cor_secundaria,
    atualizado_em: config?.atualizado_em ?? '',
  })
  const linkWhats = linkWhatsApp(form.whatsapp)

  if (carregando || !inicializado) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Esses dados alimentam o cabeçalho, o rodapé e o botão de WhatsApp do site público.
          Trocar aqui reflete no site inteiro, sem mexer em código.
        </p>
      </div>

      <form onSubmit={aoSalvar} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Identidade</h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nome">Nome da imobiliária</Label>
            <Input
              id="nome"
              required
              value={form.nome}
              onChange={(e) => atualizar('nome', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="whatsapp">WhatsApp de atendimento</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(e) => atualizar('whatsapp', e.target.value)}
                placeholder="(86) 9 9411-1289"
              />
              {form.whatsapp.trim() && !linkWhats && (
                <p className="text-xs text-destructive">
                  Número incompleto — o botão de WhatsApp não vai funcionar no site.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={form.instagram}
                onChange={(e) => atualizar('instagram', e.target.value)}
                placeholder="@ribeirooimobiliaria"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={form.endereco}
              onChange={(e) => atualizar('endereco', e.target.value)}
              placeholder="Exibido no rodapé do site"
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-muted-foreground">Marca</h2>

          <div className="flex flex-col gap-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo atual"
                  className="size-14 rounded-lg border border-border object-contain p-1"
                />
              ) : (
                <div
                  className="flex size-14 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: previa.corPrimaria }}
                >
                  {previa.iniciais}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={enviandoLogo}
                    onClick={() => inputLogoRef.current?.click()}
                  >
                    <Upload />
                    {enviandoLogo ? 'Enviando…' : form.logo_url ? 'Trocar logo' : 'Enviar logo'}
                  </Button>
                  {form.logo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => atualizar('logo_url', '')}
                    >
                      <X />
                      Remover
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WEBP, AVIF ou SVG · até 5 MB
                </p>
              </div>
              <input
                ref={inputLogoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                hidden
                onChange={aoSelecionarLogo}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cor_primaria">Cor primária</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Escolher cor primária"
                  className="size-8 shrink-0 cursor-pointer rounded-md border border-input"
                  value={corHexValida(form.cor_primaria) ? form.cor_primaria : '#0f172a'}
                  onChange={(e) => atualizar('cor_primaria', e.target.value)}
                />
                <Input
                  id="cor_primaria"
                  value={form.cor_primaria}
                  onChange={(e) => atualizar('cor_primaria', e.target.value)}
                  placeholder="#0F172A"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cor_secundaria">Cor secundária</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Escolher cor secundária"
                  className="size-8 shrink-0 cursor-pointer rounded-md border border-input"
                  value={corHexValida(form.cor_secundaria) ? form.cor_secundaria : '#64748b'}
                  onChange={(e) => atualizar('cor_secundaria', e.target.value)}
                />
                <Input
                  id="cor_secundaria"
                  value={form.cor_secundaria}
                  onChange={(e) => atualizar('cor_secundaria', e.target.value)}
                  placeholder="#64748B"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Prévia — como aparece no site
          </h2>
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              {previa.logoUrl ? (
                <img src={previa.logoUrl} alt={previa.nome} className="size-8 object-contain" />
              ) : (
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: previa.corPrimaria }}
                >
                  {previa.iniciais}
                </div>
              )}
              <span className="font-medium">{previa.nome}</span>
            </div>

            {previa.endereco && (
              <p className="text-xs text-muted-foreground">{previa.endereco}</p>
            )}

            <a
              href={linkWhats ?? undefined}
              onClick={(e) => !linkWhats && e.preventDefault()}
              aria-disabled={!linkWhats}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: previa.corPrimaria }}
            >
              <MessageCircle className="size-4" />
              Fale no WhatsApp
            </a>
          </div>
        </section>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
          {sucesso && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Salvo
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
