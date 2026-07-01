import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSoles(amount: number) {
  return `S/ ${amount.toLocaleString('es-PE')}`
}
