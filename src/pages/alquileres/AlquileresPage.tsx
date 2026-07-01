import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION as ALQUILERES_COLLECTION, mapAlquiler, createAlquiler, updateAlquiler, deleteAlquiler } from '@/services/alquileres'
import { COLLECTION as TERNOS_COLLECTION, mapTerno } from '@/services/ternos'
import { COLLECTION as CLIENTES_COLLECTION, mapCliente, clienteFullName } from '@/services/clientes'
import {
  alquilerSchema,
  ALQUILER_ESTADO_LABELS,
  TernoEstado,
  type Alquiler,
  type AlquilerForm,
  type Terno,
  type Cliente,
} from '@/types'
import { formatSoles } from '@/lib/utils'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { AlquilerEstadoBadge } from '@/components/StatusBadge'
import { SearchableSelect } from '@/components/SearchableSelect'
import { DatePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AlquileresPage() {
  const { items: alquileres, loading } = useCollection<Alquiler>(ALQUILERES_COLLECTION, mapAlquiler)
  const { items: ternos } = useCollection<Terno>(TERNOS_COLLECTION, mapTerno)
  const { items: clientes } = useCollection<Cliente>(CLIENTES_COLLECTION, mapCliente)

  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Alquiler | null>(null)
  const [deleting, setDeleting] = useState<Alquiler | null>(null)
  const [saving, setSaving] = useState(false)

  const ternoMap = useMemo(() => Object.fromEntries(ternos.map((t) => [t.id, t])), [ternos])
  const clienteMap = useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes])

  const ternosEnTienda = useMemo(
    () => ternos.filter((t) => t.estado === TernoEstado.EN_TIENDA),
    [ternos],
  )

  const ternoOptionsForForm = useMemo(() => {
    const available = editing
      ? ternos.filter((t) => t.estado === TernoEstado.EN_TIENDA || t.id === editing.ternoId)
      : ternosEnTienda
    return available.map((t) => ({ value: t.id, label: t.nombre }))
  }, [ternos, ternosEnTienda, editing])

  const clienteOptions = useMemo(
    () => clientes.map((c) => ({ value: c.id, label: clienteFullName(c) })),
    [clientes],
  )

  const form = useForm<AlquilerForm>({
    resolver: zodResolver(alquilerSchema),
    defaultValues: {
      ternoId: '',
      clienteId: '',
      precio: 120,
      fechaEntrega: new Date(),
      fechaDevolucion: new Date(),
      estado: 'entregado',
    },
  })

  const filtered = alquileres.filter((item) => {
    const terno = ternoMap[item.ternoId]
    const cliente = clienteMap[item.clienteId]
    const ternoName = terno?.nombre ?? ''
    const clienteName = cliente ? clienteFullName(cliente) : ''
    const matchSearch =
      ternoName.toLowerCase().includes(search.toLowerCase()) ||
      clienteName.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'all' || item.estado === filterEstado
    return matchSearch && matchEstado
  })

  const openCreate = () => {
    setEditing(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    form.reset({
      ternoId: ternosEnTienda[0]?.id ?? '',
      clienteId: clientes[0]?.id ?? '',
      precio: 120,
      fechaEntrega: new Date(),
      fechaDevolucion: tomorrow,
      estado: 'entregado',
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Alquiler) => {
    setEditing(item)
    form.reset({
      ternoId: item.ternoId,
      clienteId: item.clienteId,
      precio: item.precio,
      fechaEntrega: item.fechaEntrega,
      fechaDevolucion: item.fechaDevolucion,
      estado: item.estado,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: AlquilerForm) => {
    setSaving(true)
    try {
      if (editing) {
        await updateAlquiler(editing.id, data, editing.ternoId, editing.estado)
      } else {
        await createAlquiler(data)
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await deleteAlquiler(deleting.id, deleting.ternoId, deleting.estado)
      setDeleteOpen(false)
      setDeleting(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Alquileres" description="Gestiona los alquileres de ternos" onNew={openCreate} />

      <DataTable
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por terno o cliente..."
        filters={
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(ALQUILER_ESTADO_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        columns={[
          {
            key: 'terno',
            header: 'Terno',
            render: (item) => ternoMap[item.ternoId]?.nombre ?? 'Terno eliminado',
          },
          {
            key: 'cliente',
            header: 'Cliente',
            render: (item) => {
              const c = clienteMap[item.clienteId]
              return c ? clienteFullName(c) : 'Cliente eliminado'
            },
          },
          {
            key: 'precio',
            header: 'Precio',
            render: (item) => formatSoles(item.precio),
          },
          {
            key: 'fechaEntrega',
            header: 'Entrega',
            render: (item) => format(item.fechaEntrega, 'dd/MM/yyyy', { locale: es }),
          },
          {
            key: 'fechaDevolucion',
            header: 'Devolución',
            render: (item) => format(item.fechaDevolucion, 'dd/MM/yyyy', { locale: es }),
          },
          {
            key: 'estado',
            header: 'Estado',
            render: (item) => <AlquilerEstadoBadge estado={item.estado} />,
          },
        ]}
        actions={(item) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleting(item)
                setDeleteOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar alquiler' : 'Nuevo alquiler'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Terno</Label>
              <Controller
                control={form.control}
                name="ternoId"
                render={({ field }) => (
                  <SearchableSelect
                    options={ternoOptionsForForm}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar terno..."
                    searchPlaceholder="Buscar terno..."
                    emptyMessage="No hay ternos en tienda"
                  />
                )}
              />
              {form.formState.errors.ternoId && (
                <p className="text-sm text-destructive">{form.formState.errors.ternoId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Controller
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <SearchableSelect
                    options={clienteOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccionar cliente..."
                    searchPlaceholder="Buscar cliente..."
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input type="number" {...form.register('precio', { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de entrega</Label>
                <Controller
                  control={form.control}
                  name="fechaEntrega"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={(d) => field.onChange(d ?? new Date())} />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de devolución</Label>
                <Controller
                  control={form.control}
                  name="fechaDevolucion"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={(d) => field.onChange(d ?? new Date())} />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Controller
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ALQUILER_ESTADO_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar alquiler"
        description="¿Estás seguro de eliminar este alquiler?"
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  )
}
