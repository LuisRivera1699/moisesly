import { Badge } from '@/components/ui/badge'
import {
  TERNO_ESTADO_LABELS,
  PRODUCTO_ESTADO_LABELS,
  ALQUILER_ESTADO_LABELS,
  type TernoEstadoType,
  type ProductoEstadoType,
  type AlquilerEstadoType,
} from '@/types'
import { cn } from '@/lib/utils'

const ternoColors: Record<TernoEstadoType, string> = {
  en_tienda: 'bg-green-100 text-green-800 border-green-200',
  alquilado: 'bg-blue-100 text-blue-800 border-blue-200',
  lavandose: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactivo: 'bg-gray-100 text-gray-600 border-gray-200',
}

const productoColors: Record<ProductoEstadoType, string> = {
  con_stock: 'bg-green-100 text-green-800 border-green-200',
  sin_stock: 'bg-orange-100 text-orange-800 border-orange-200',
  inactivo: 'bg-gray-100 text-gray-600 border-gray-200',
}

const alquilerColors: Record<AlquilerEstadoType, string> = {
  entregado: 'bg-blue-100 text-blue-800 border-blue-200',
  devuelto: 'bg-green-100 text-green-800 border-green-200',
}

export function TernoEstadoBadge({ estado }: { estado: TernoEstadoType }) {
  return (
    <Badge className={cn('border', ternoColors[estado])}>
      {TERNO_ESTADO_LABELS[estado]}
    </Badge>
  )
}

export function ProductoEstadoBadge({ estado }: { estado: ProductoEstadoType }) {
  return (
    <Badge className={cn('border', productoColors[estado])}>
      {PRODUCTO_ESTADO_LABELS[estado]}
    </Badge>
  )
}

export function AlquilerEstadoBadge({ estado }: { estado: AlquilerEstadoType }) {
  return (
    <Badge className={cn('border', alquilerColors[estado])}>
      {ALQUILER_ESTADO_LABELS[estado]}
    </Badge>
  )
}
