import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/lib/auth'

export default function RotaProtegida() {
  const { session, carregando } = useAuth()
  const local = useLocation()

  // Enquanto não sabemos se há sessão, não decidimos nada — mandar para o
  // login aqui faria o painel piscar a tela de login a cada refresh.
  if (carregando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    )
  }

  if (!session) {
    // `state.de` leva o usuário de volta ao que ele tentou abrir.
    return <Navigate to="/admin/login" replace state={{ de: local.pathname }} />
  }

  return <Outlet />
}
