import type { ComponentProps } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      className={cn('p-3', className)}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
