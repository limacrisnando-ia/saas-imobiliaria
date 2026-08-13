import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from '@/components/admin/AdminLayout'
import RotaProtegida from '@/components/RotaProtegida'
import { AuthProvider } from '@/lib/auth'
import Configuracoes from '@/pages/admin/Configuracoes'
import Imoveis from '@/pages/admin/Imoveis'
import Login from '@/pages/admin/Login'
import Visitas from '@/pages/admin/Visitas'
import Home from '@/pages/public/Home'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin/login" element={<Login />} />
        <Route element={<RotaProtegida />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="imoveis" replace />} />
            <Route path="imoveis" element={<Imoveis />} />
            <Route path="visitas" element={<Visitas />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
