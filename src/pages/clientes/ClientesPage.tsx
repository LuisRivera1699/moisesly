import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { COLLECTION, mapCliente, clienteFullName } from '@/services/clientes'
import { clienteSchema, type Cliente, type ClienteForm } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { DataTable } from '@/components/DataTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ClientesPage() {
  const { items, loading, create, update, remove } = useCollection<Cliente>(COLLECTION, mapCliente)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [deleting, setDeleting] = useState<Cliente | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre: '', apellido: '', direccion: '', telefono: '', medidas: '' },
  })

  const filtered = items.filter((item) => {
    const full = clienteFullName(item).toLowerCase()
    return full.includes(search.toLowerCase())
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ nombre: '', apellido: '', direccion: '', telefono: '', medidas: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: Cliente) => {
    setEditing(item)
    form.reset({
      nombre: item.nombre,
      apellido: item.apellido,
      direccion: item.direccion ?? '',
      telefono: item.telefono ?? '',
      medidas: item.medidas ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ClienteForm) => {
    setSaving(true)
    try {
      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        medidas: data.medidas || null,
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
      <PageHeader title="Clientes" description="Gestiona los clientes del negocio" onNew={openCreate} />

      <DataTable
        data={filtered}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre..."
        columns={[
          { key: 'nombre', header: 'Nombre', render: (item) => clienteFullName(item) },
          { key: 'telefono', header: 'Teléfono', render: (item) => item.telefono || '—' },
          { key: 'direccion', header: 'Dirección', render: (item) => item.direccion || '—' },
          { key: 'medidas', header: 'Medidas', render: (item) => item.medidas || '—' },
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
            <DialogTitle>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...form.register('nombre')} />
                {form.formState.errors.nombre && (
                  <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...form.register('apellido')} />
                {form.formState.errors.apellido && (
                  <p className="text-sm text-destructive">{form.formState.errors.apellido.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección (opcional)</Label>
              <Input {...form.register('direccion')} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono (opcional)</Label>
              <Input {...form.register('telefono')} />
            </div>
            <div className="space-y-2">
              <Label>Medidas (opcional)</Label>
              <Input {...form.register('medidas')} />
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
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a "${deleting ? clienteFullName(deleting) : ''}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  )
}
