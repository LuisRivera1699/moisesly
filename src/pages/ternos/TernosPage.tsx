import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION as TERNOS_COLLECTION, mapTerno } from '@/services/ternos'
import { COLLECTION as UBICACIONES_COLLECTION, mapUbicacion } from '@/services/ubicaciones'
import {
  ternoSchema,
  TERNO_ESTADO_LABELS,
  TernoEstado,
  type Terno,
  type TernoForm,
  type Ubicacion,
} from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TernoEstadoBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function TernosPage() {
  const { items: ternos, loading, create, update, remove } = useCollection<Terno>(TERNOS_COLLECTION, mapTerno)
  const { items: ubicaciones } = useCollection<Ubicacion>(UBICACIONES_COLLECTION, mapUbicacion)

  const [search, setSearch] = useState('')
  const [filterUbicacion, setFilterUbicacion] = useState('all')
  const [filterEstado, setFilterEstado] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Terno | null>(null)
  const [deleting, setDeleting] = useState<Terno | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const ubicacionMap = useMemo(
    () => Object.fromEntries(ubicaciones.map((u) => [u.id, u.nombre])),
    [ubicaciones],
  )

  const form = useForm<TernoForm>({
    resolver: zodResolver(ternoSchema),
    defaultValues: {
      nombre: '',
      medidasPantalon: '',
      medidasTerno: '',
      color: '',
      descripcionExtra: '',
      ubicacionId: '',
      estado: TernoEstado.EN_TIENDA,
    },
  })

  const filtered = ternos.filter((item) => {
    const matchSearch = item.nombre.toLowerCase().includes(search.toLowerCase())
    const matchUbicacion = filterUbicacion === 'all' || item.ubicacionId === filterUbicacion
    const matchEstado = filterEstado === 'all' || item.estado === filterEstado
    return matchSearch && matchUbicacion && matchEstado
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      nombre: '',
      medidasPantalon: '',
      medidasTerno: '',
      color: '',
      descripcionExtra: '',
      ubicacionId: ubicaciones[0]?.id ?? '',
      estado: TernoEstado.EN_TIENDA,
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Terno) => {
    setEditing(item)
    form.reset({
      nombre: item.nombre,
      medidasPantalon: item.medidasPantalon,
      medidasTerno: item.medidasTerno,
      color: item.color,
      descripcionExtra: item.descripcionExtra ?? '',
      ubicacionId: item.ubicacionId,
      estado: item.estado,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: TernoForm) => {
    setSaving(true)
    try {
      const payload = {
        nombre: data.nombre,
        medidasPantalon: data.medidasPantalon,
        medidasTerno: data.medidasTerno,
        color: data.color,
        descripcionExtra: data.descripcionExtra || null,
        ubicacionId: data.ubicacionId,
        estado: data.estado,
      }
      if (editing) {
        await update(editing.id, payload)
      } else {
        await create(payload)
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteError(null)
    const alquileresSnap = await getDocs(
      query(
        collection(db, 'alquileres'),
        where('ternoId', '==', deleting.id),
        where('estado', '==', 'entregado'),
      ),
    )
    if (!alquileresSnap.empty) {
      setDeleteError('No se puede eliminar: el terno tiene un alquiler activo.')
      return
    }
    setSaving(true)
    try {
      await remove(deleting.id)
      setDeleteOpen(false)
      setDeleting(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Ternos" description="Gestiona el inventario de ternos" onNew={openCreate} />

      <DataTable
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre..."
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {ubicaciones.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(TERNO_ESTADO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        columns={[
          { key: 'nombre', header: 'Nombre', render: (item) => item.nombre },
          { key: 'color', header: 'Color', render: (item) => item.color },
          { key: 'ubicacion', header: 'Ubicación', render: (item) => ubicacionMap[item.ubicacionId] || '—' },
          { key: 'estado', header: 'Estado', render: (item) => <TernoEstadoBadge estado={item.estado} /> },
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
                setDeleteError(null)
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
            <DialogTitle>{editing ? 'Editar terno' : 'Nuevo terno'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register('nombre')} />
              {form.formState.errors.nombre && (
                <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medidas pantalón</Label>
                <Input {...form.register('medidasPantalon')} />
              </div>
              <div className="space-y-2">
                <Label>Medidas terno</Label>
                <Input {...form.register('medidasTerno')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input {...form.register('color')} />
            </div>
            <div className="space-y-2">
              <Label>Descripción extra (opcional)</Label>
              <Textarea {...form.register('descripcionExtra')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Controller
                  control={form.control}
                  name="ubicacionId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {ubicaciones.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                        {Object.entries(TERNO_ESTADO_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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
        title="Eliminar terno"
        description={deleteError ?? `¿Estás seguro de eliminar "${deleting?.nombre}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  )
}
