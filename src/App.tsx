import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UbicacionesPage } from '@/pages/ubicaciones/UbicacionesPage'
import { CategoriasPage } from '@/pages/categorias/CategoriasPage'
import { ClientesPage } from '@/pages/clientes/ClientesPage'
import { TernosPage } from '@/pages/ternos/TernosPage'
import { ProductosPage } from '@/pages/productos/ProductosPage'
import { AlquileresPage } from '@/pages/alquileres/AlquileresPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ubicaciones" element={<UbicacionesPage />} />
            <Route path="/ternos" element={<TernosPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/alquileres" element={<AlquileresPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
