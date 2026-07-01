import type { DocumentData } from 'firebase/firestore'
import type { Ubicacion } from '@/types'

export const COLLECTION = 'ubicaciones'

export function mapUbicacion(data: DocumentData): Omit<Ubicacion, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: data.nombre ?? '',
    descripcion: data.descripcion ?? null,
  }
}
