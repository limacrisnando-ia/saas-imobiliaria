import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { resolverBranding } from '@/lib/branding'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

export default function Login() {
  const { session, carregando, entrar } = useAuth()
  const navigate = useNavigate()
  const local = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [config, setConfig] = useState<Tables<'configuracoes'> | null>(null)

  // O nome da imobiliária vem do banco — nunca hardcoded (regra de replicação).
  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('*')
      .maybeSingle()
      .then(({ data }) => setConfig(data))
  }, [])

  const branding = resolverBranding(config)
  const destino = (local.state as { de?: string } | null)?.de ?? '/admin'

  if (!carregando && session) return <Navigate to={destino} replace />

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)

    const { erro: falha } = await entrar(email, senha)

    if (falha) {
      setErro(falha)
      setEnviando(false)
      return
    }
    navigate(destino, { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.nome}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div
              className="flex size-12 items-center justify-center rounded-xl text-base font-semibold text-white"
              style={{ backgroundColor: branding.corPrimaria }}
            >
              {branding.iniciais}
            </div>
          )}
          <div>
            <h1 className="text-lg font-medium">{branding.nome}</h1>
            <p className="text-sm text-muted-foreground">Entre para acessar o painel</p>
          </div>
        </div>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={enviando}
              aria-invalid={erro ? true : undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={enviando}
              aria-invalid={erro ? true : undefined}
            />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          )}

          <Button type="submit" size="lg" disabled={enviando} className="mt-1 w-full">
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
