import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  emptyMessage?: string
  filters?: React.ReactNode
  actions?: (item: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay registros',
  filters,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        )}
        {filters}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th key={col.key} className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 align-middle">
                      {col.render(item)}
                    </td>
                  ))}
                  {actions && <td className="p-4 align-middle text-right">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
