import { Route, Routes } from 'react-router-dom'

import RotaProtegida from '@/components/RotaProtegida'
import { AuthProvider } from '@/lib/auth'
import Dashboard from '@/pages/admin/Dashboard'
import Login from '@/pages/admin/Login'
import Home from '@/pages/public/Home'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin/login" element={<Login />} />
        <Route element={<RotaProtegida />}>
          <Route path="/admin" element={<Dashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
