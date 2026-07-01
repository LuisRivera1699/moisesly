import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
