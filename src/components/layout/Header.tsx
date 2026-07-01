import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="md:ml-0 ml-12" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  )
}
