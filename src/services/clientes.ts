import type { DocumentData } from 'firebase/firestore'
import type { Cliente } from '@/types'

export const COLLECTION = 'clientes'

export function mapCliente(data: DocumentData): Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: data.nombre ?? '',
    apellido: data.apellido ?? '',
    direccion: data.direccion ?? null,
    telefono: data.telefono ?? null,
    medidas: data.medidas ?? null,
  }
}

export function clienteFullName(cliente: Cliente): string {
  return `${cliente.nombre} ${cliente.apellido}`
}
