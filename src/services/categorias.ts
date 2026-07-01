import type { DocumentData } from 'firebase/firestore'
import type { Categoria } from '@/types'

export const COLLECTION = 'categorias'

export function mapCategoria(data: DocumentData): Omit<Categoria, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: data.nombre ?? '',
    descripcion: data.descripcion ?? null,
  }
}
