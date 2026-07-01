import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Shirt,
  Tags,
  Package,
  Users,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { to: '/ternos', label: 'Ternos', icon: Shirt },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/alquileres', label: 'Alquileres', icon: ClipboardList },
]

export function Sidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-bold text-primary">Moises Ly</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background transition-transform md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <NavContent />
      </aside>
    </>
  )
}
