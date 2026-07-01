import type { DocumentData } from 'firebase/firestore'
import type { Producto, ProductoEstadoType } from '@/types'

export const COLLECTION = 'productos'

export function mapProducto(data: DocumentData): Omit<Producto, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: data.nombre ?? '',
    categoriaId: data.categoriaId ?? '',
    ubicacionId: data.ubicacionId ?? '',
    descripcion: data.descripcion ?? null,
    estado: (data.estado ?? 'con_stock') as ProductoEstadoType,
  }
}
