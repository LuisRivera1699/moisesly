import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  onNew?: () => void
  newLabel?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, onNew, newLabel = 'Nuevo', actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex gap-2">
        {actions}
        {onNew && (
          <Button onClick={onNew}>
            <Plus className="mr-2 h-4 w-4" />
            {newLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
