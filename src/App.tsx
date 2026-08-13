import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from '@/components/admin/AdminLayout'
import PublicLayout from '@/components/public/PublicLayout'
import RotaProtegida from '@/components/RotaProtegida'
import { AuthProvider } from '@/lib/auth'
import { BrandingProvider } from '@/lib/branding-context'
import Configuracoes from '@/pages/admin/Configuracoes'
import ImovelFormulario from '@/pages/admin/imoveis/ImovelFormulario'
import ImoveisLista from '@/pages/admin/imoveis/ImoveisLista'
import Login from '@/pages/admin/Login'
import VisitaFormulario from '@/pages/admin/visitas/VisitaFormulario'
import VisitasLista from '@/pages/admin/visitas/VisitasLista'
import Catalogo from '@/pages/public/Catalogo'
import Home from '@/pages/public/Home'
import ImovelDetalhe from '@/pages/public/ImovelDetalhe'

function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<Catalogo />} />
            <Route path="/imoveis/:slug" element={<ImovelDetalhe />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route element={<RotaProtegida />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="imoveis" replace />} />
              <Route path="imoveis" element={<ImoveisLista />} />
              <Route path="imoveis/novo" element={<ImovelFormulario />} />
              <Route path="imoveis/:id/editar" element={<ImovelFormulario />} />
              <Route path="visitas" element={<VisitasLista />} />
              <Route path="visitas/nova" element={<VisitaFormulario />} />
              <Route path="visitas/:id/editar" element={<VisitaFormulario />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrandingProvider>
  )
}

export default App
