import { useMemo, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  isWithinInterval,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, DollarSign, ClipboardList, AlertCircle } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION as ALQUILERES_COLLECTION, mapAlquiler } from '@/services/alquileres'
import { COLLECTION as TERNOS_COLLECTION, mapTerno } from '@/services/ternos'
import { COLLECTION as CLIENTES_COLLECTION, mapCliente, clienteFullName } from '@/services/clientes'
import type { Alquiler, Terno, Cliente } from '@/types'
import { formatSoles } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlquilerEstadoBadge } from '@/components/StatusBadge'

export function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { items: alquileres, loading } = useCollection<Alquiler>(ALQUILERES_COLLECTION, mapAlquiler)
  const { items: ternos } = useCollection<Terno>(TERNOS_COLLECTION, mapTerno)
  const { items: clientes } = useCollection<Cliente>(CLIENTES_COLLECTION, mapCliente)

  const ternoMap = useMemo(() => Object.fromEntries(ternos.map((t) => [t.id, t])), [ternos])
  const clienteMap = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const alquileresDelMes = useMemo(
    () =>
      alquileres.filter((a) =>
        isWithinInterval(a.fechaEntrega, { start: monthStart, end: monthEnd }),
      ),
    [alquileres, monthStart, monthEnd],
  )

  const ingresosDelMes = useMemo(
    () => alquileresDelMes.reduce((sum, a) => sum + a.precio, 0),
    [alquileresDelMes],
  )

  const sinDevolver = useMemo(
    () => alquileres.filter((a) => a.estado === 'entregado'),
    [alquileres],
  )

  const devolucionesPendientes = useMemo(() => {
    const hoy = startOfDay(new Date())
    return alquileres
      .filter(
        (a) =>
          a.estado === 'entregado' && startOfDay(a.fechaDevolucion) <= hoy,
      )
      .sort((a, b) => a.fechaDevolucion.getTime() - b.fechaDevolucion.getTime())
  }, [alquileres])

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen del negocio</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[180px] text-center text-lg font-medium capitalize">{monthLabel}</span>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alquileres del mes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : alquileresDelMes.length}
            </div>
            <p className="text-xs text-muted-foreground">Por fecha de entrega</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatSoles(ingresosDelMes)}
            </div>
            <p className="text-xs text-muted-foreground">Suma de precios de alquileres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sin devolver</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : sinDevolver.length}
            </div>
            <p className="text-xs text-muted-foreground">Alquileres activos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Devoluciones pendientes hasta hoy ({devolucionesPendientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : devolucionesPendientes.length === 0 ? (
            <p className="text-muted-foreground">No hay devoluciones pendientes hasta hoy.</p>
          ) : (
            <div className="space-y-3">
              {devolucionesPendientes.map((alquiler) => {
                const cliente = clienteMap[alquiler.clienteId]
                const terno = ternoMap[alquiler.ternoId]
                return (
                  <div
                    key={alquiler.id}
                    className="flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {cliente ? clienteFullName(cliente) : 'Cliente eliminado'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Terno: {terno?.nombre ?? 'Terno eliminado'}
                      </p>
                      {cliente?.telefono && (
                        <p className="text-sm text-muted-foreground">Tel: {cliente.telefono}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {format(alquiler.fechaDevolucion, 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <AlquilerEstadoBadge estado={alquiler.estado} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
