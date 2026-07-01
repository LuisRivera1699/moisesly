import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION, mapCategoria } from '@/services/categorias'
import { categoriaSchema, type Categoria, type CategoriaForm } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function CategoriasPage() {
  const { items, loading, create, update, remove } = useCollection<Categoria>(COLLECTION, mapCategoria)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState<Categoria | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const form = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nombre: '', descripcion: '' },
  })

  const filtered = items.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => {
    setEditing(null)
    form.reset({ nombre: '', descripcion: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Categoria) => {
    setEditing(item)
    form.reset({ nombre: item.nombre, descripcion: item.descripcion ?? '' })
    setDialogOpen(true)
  }

  const onSubmit = async (data: CategoriaForm) => {
    setSaving(true)
    try {
      const payload = { nombre: data.nombre, descripcion: data.descripcion || null }
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
    const productosSnap = await getDocs(
      query(collection(db, 'productos'), where('categoriaId', '==', deleting.id)),
    )
    if (!productosSnap.empty) {
      setDeleteError('No se puede eliminar: hay productos asociados a esta categoría.')
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
      <PageHeader title="Categorías" description="Gestiona las categorías de productos de venta" onNew={openCreate} />

      <DataTable
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre..."
        columns={[
          { key: 'nombre', header: 'Nombre', render: (item) => item.nombre },
          { key: 'descripcion', header: 'Descripción', render: (item) => item.descripcion || '—' },
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...form.register('nombre')} />
              {form.formState.errors.nombre && (
                <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Textarea {...form.register('descripcion')} />
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
        title="Eliminar categoría"
        description={deleteError ?? `¿Estás seguro de eliminar "${deleting?.nombre}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  )
}
