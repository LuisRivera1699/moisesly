import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Alquiler, AlquilerEstadoType, AlquilerForm } from '@/types'
import { TernoEstado } from '@/types'

export const COLLECTION = 'alquileres'
const TERNOS_COLLECTION = 'ternos'

export function mapAlquiler(data: DocumentData): Omit<Alquiler, 'id' | 'createdAt' | 'updatedAt'> {
  const toDate = (val: Timestamp | Date | undefined) => {
    if (!val) return new Date()
    if (val instanceof Date) return val
    return val.toDate()
  }

  return {
    ternoId: data.ternoId ?? '',
    clienteId: data.clienteId ?? '',
    precio: data.precio ?? 120,
    fechaEntrega: toDate(data.fechaEntrega),
    fechaDevolucion: toDate(data.fechaDevolucion),
    estado: (data.estado ?? 'entregado') as AlquilerEstadoType,
  }
}

function alquilerToFirestore(data: AlquilerForm) {
  return {
    ternoId: data.ternoId,
    clienteId: data.clienteId,
    precio: data.precio,
    fechaEntrega: Timestamp.fromDate(data.fechaEntrega),
    fechaDevolucion: Timestamp.fromDate(data.fechaDevolucion),
    estado: data.estado,
  }
}

export async function createAlquiler(data: AlquilerForm) {
  const batch = writeBatch(db)
  const alquilerRef = doc(collection(db, COLLECTION))

  batch.set(alquilerRef, {
    ...alquilerToFirestore(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (data.estado === 'entregado') {
    batch.update(doc(db, TERNOS_COLLECTION, data.ternoId), {
      estado: TernoEstado.ALQUILADO,
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
  return alquilerRef.id
}

export async function updateAlquiler(
  id: string,
  data: AlquilerForm,
  previousTernoId: string,
  previousEstado: AlquilerEstadoType,
) {
  const batch = writeBatch(db)
  batch.update(doc(db, COLLECTION, id), {
    ...alquilerToFirestore(data),
    updatedAt: serverTimestamp(),
  })

  if (previousEstado === 'entregado' && previousTernoId !== data.ternoId) {
    batch.update(doc(db, TERNOS_COLLECTION, previousTernoId), {
      estado: TernoEstado.EN_TIENDA,
      updatedAt: serverTimestamp(),
    })
  }

  if (data.estado === 'entregado') {
    batch.update(doc(db, TERNOS_COLLECTION, data.ternoId), {
      estado: TernoEstado.ALQUILADO,
      updatedAt: serverTimestamp(),
    })
  } else if (data.estado === 'devuelto') {
    batch.update(doc(db, TERNOS_COLLECTION, data.ternoId), {
      estado: TernoEstado.EN_TIENDA,
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
}

export async function deleteAlquiler(id: string, ternoId: string, estado: AlquilerEstadoType) {
  const batch = writeBatch(db)
  batch.delete(doc(db, COLLECTION, id))

  if (estado === 'entregado') {
    batch.update(doc(db, TERNOS_COLLECTION, ternoId), {
      estado: TernoEstado.EN_TIENDA,
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
}
