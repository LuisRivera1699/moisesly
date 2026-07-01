import { z } from 'zod'

export const TernoEstado = {
  EN_TIENDA: 'en_tienda',
  ALQUILADO: 'alquilado',
  LAVANDOSE: 'lavandose',
  INACTIVO: 'inactivo',
} as const

export type TernoEstadoType = (typeof TernoEstado)[keyof typeof TernoEstado]

export const ProductoEstado = {
  CON_STOCK: 'con_stock',
  SIN_STOCK: 'sin_stock',
  INACTIVO: 'inactivo',
} as const

export type ProductoEstadoType = (typeof ProductoEstado)[keyof typeof ProductoEstado]

export const AlquilerEstado = {
  ENTREGADO: 'entregado',
  DEVUELTO: 'devuelto',
} as const

export type AlquilerEstadoType = (typeof AlquilerEstado)[keyof typeof AlquilerEstado]

export interface BaseDoc {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface Ubicacion extends BaseDoc {
  nombre: string
  descripcion: string | null
}

export interface Categoria extends BaseDoc {
  nombre: string
  descripcion: string | null
}

export interface Cliente extends BaseDoc {
  nombre: string
  apellido: string
  direccion: string | null
  telefono: string | null
  medidas: string | null
}

export interface Terno extends BaseDoc {
  nombre: string
  medidasPantalon: string
  medidasTerno: string
  color: string
  descripcionExtra: string | null
  ubicacionId: string
  estado: TernoEstadoType
}

export interface Producto extends BaseDoc {
  nombre: string
  categoriaId: string
  ubicacionId: string
  descripcion: string | null
  estado: ProductoEstadoType
}

export interface Alquiler extends BaseDoc {
  ternoId: string
  clienteId: string
  precio: number
  fechaEntrega: Date
  fechaDevolucion: Date
  estado: AlquilerEstadoType
}

export const ubicacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

export const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
})

export const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  medidas: z.string().optional(),
})

export const ternoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  medidasPantalon: z.string().min(1, 'Las medidas del pantalón son requeridas'),
  medidasTerno: z.string().min(1, 'Las medidas del terno son requeridas'),
  color: z.string().min(1, 'El color es requerido'),
  descripcionExtra: z.string().optional(),
  ubicacionId: z.string().min(1, 'La ubicación es requerida'),
  estado: z.enum(['en_tienda', 'alquilado', 'lavandose', 'inactivo']),
})

export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoriaId: z.string().min(1, 'La categoría es requerida'),
  ubicacionId: z.string().min(1, 'La ubicación es requerida'),
  descripcion: z.string().optional(),
  estado: z.enum(['con_stock', 'sin_stock', 'inactivo']),
})

export const alquilerSchema = z.object({
  ternoId: z.string().min(1, 'El terno es requerido'),
  clienteId: z.string().min(1, 'El cliente es requerido'),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  fechaEntrega: z.date({ message: 'La fecha de entrega es requerida' }),
  fechaDevolucion: z.date({ message: 'La fecha de devolución es requerida' }),
  estado: z.enum(['entregado', 'devuelto']),
})

export const TERNO_ESTADO_LABELS: Record<TernoEstadoType, string> = {
  en_tienda: 'En tienda',
  alquilado: 'Alquilado',
  lavandose: 'Lavándose',
  inactivo: 'Inactivo',
}

export const PRODUCTO_ESTADO_LABELS: Record<ProductoEstadoType, string> = {
  con_stock: 'Con stock',
  sin_stock: 'Sin stock',
  inactivo: 'Inactivo',
}

export const ALQUILER_ESTADO_LABELS: Record<AlquilerEstadoType, string> = {
  entregado: 'Entregado',
  devuelto: 'Devuelto',
}

export type UbicacionForm = z.infer<typeof ubicacionSchema>
export type CategoriaForm = z.infer<typeof categoriaSchema>
export type ClienteForm = z.infer<typeof clienteSchema>
export type TernoForm = z.infer<typeof ternoSchema>
export type ProductoForm = z.infer<typeof productoSchema>
export type AlquilerForm = z.infer<typeof alquilerSchema>
