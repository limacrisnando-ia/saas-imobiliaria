import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/public/Home'
import Dashboard from '@/pages/admin/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  )
}

export default App
