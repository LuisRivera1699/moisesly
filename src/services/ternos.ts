import type { DocumentData } from 'firebase/firestore'
import type { Terno, TernoEstadoType } from '@/types'

export const COLLECTION = 'ternos'

export function mapTerno(data: DocumentData): Omit<Terno, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: data.nombre ?? '',
    medidasPantalon: data.medidasPantalon ?? '',
    medidasTerno: data.medidasTerno ?? '',
    color: data.color ?? '',
    descripcionExtra: data.descripcionExtra ?? null,
    ubicacionId: data.ubicacionId ?? '',
    estado: (data.estado ?? 'en_tienda') as TernoEstadoType,
  }
}
