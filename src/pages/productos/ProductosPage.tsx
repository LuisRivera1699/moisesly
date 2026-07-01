import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION as PRODUCTOS_COLLECTION, mapProducto } from '@/services/productos'
import { COLLECTION as CATEGORIAS_COLLECTION, mapCategoria } from '@/services/categorias'
import { COLLECTION as UBICACIONES_COLLECTION, mapUbicacion } from '@/services/ubicaciones'
import {
  productoSchema,
  PRODUCTO_ESTADO_LABELS,
  type Producto,
  type ProductoForm,
  type Categoria,
  type Ubicacion,
} from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ProductoEstadoBadge } from '@/components/StatusBadge'
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

export function ProductosPage() {
  const { items: productos, loading, create, update, remove } = useCollection<Producto>(
    PRODUCTOS_COLLECTION,
    mapProducto,
  )
  const { items: categorias } = useCollection<Categoria>(CATEGORIAS_COLLECTION, mapCategoria)
  const { items: ubicaciones } = useCollection<Ubicacion>(UBICACIONES_COLLECTION, mapUbicacion)

  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('all')
  const [filterUbicacion, setFilterUbicacion] = useState('all')
  const [filterEstado, setFilterEstado] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [deleting, setDeleting] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)

  const categoriaMap = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id, c.nombre])),
    [categorias],
  )
  const ubicacionMap = useMemo(
    () => Object.fromEntries(ubicaciones.map((u) => [u.id, u.nombre])),
    [ubicaciones],
  )

  const form = useForm<ProductoForm>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      categoriaId: '',
      ubicacionId: '',
      descripcion: '',
      estado: 'con_stock',
    },
  })

  const filtered = productos.filter((item) => {
    const matchSearch = item.nombre.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = filterCategoria === 'all' || item.categoriaId === filterCategoria
    const matchUbicacion = filterUbicacion === 'all' || item.ubicacionId === filterUbicacion
    const matchEstado = filterEstado === 'all' || item.estado === filterEstado
    return matchSearch && matchCategoria && matchUbicacion && matchEstado
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      nombre: '',
      categoriaId: categorias[0]?.id ?? '',
      ubicacionId: ubicaciones[0]?.id ?? '',
      descripcion: '',
      estado: 'con_stock',
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Producto) => {
    setEditing(item)
    form.reset({
      nombre: item.nombre,
      categoriaId: item.categoriaId,
      ubicacionId: item.ubicacionId,
      descripcion: item.descripcion ?? '',
      estado: item.estado,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ProductoForm) => {
    setSaving(true)
    try {
      const payload = {
        nombre: data.nombre,
        categoriaId: data.categoriaId,
        ubicacionId: data.ubicacionId,
        descripcion: data.descripcion || null,
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
      <PageHeader title="Productos" description="Gestiona los productos de venta" onNew={openCreate} />

      <DataTable
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre..."
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterUbicacion} onValueChange={setFilterUbicacion}>
              <SelectTrigger className="w-[160px]">
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(PRODUCTO_ESTADO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        columns={[
          { key: 'nombre', header: 'Nombre', render: (item) => item.nombre },
          { key: 'categoria', header: 'Categoría', render: (item) => categoriaMap[item.categoriaId] || '—' },
          { key: 'ubicacion', header: 'Ubicación', render: (item) => ubicacionMap[item.ubicacionId] || '—' },
          { key: 'estado', header: 'Estado', render: (item) => <ProductoEstadoBadge estado={item.estado} /> },
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register('nombre')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Controller
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
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
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea {...form.register('descripcion')} />
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
                      {Object.entries(PRODUCTO_ESTADO_LABELS).map(([value, label]) => (
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
        title="Eliminar producto"
        description={`¿Estás seguro de eliminar "${deleting?.nombre}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  )
}
