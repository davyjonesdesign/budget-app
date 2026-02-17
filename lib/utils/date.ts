import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function getMonthDays(date: Date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date)
  const end = endOfWeek(date)
  return eachDayOfInterval({ start, end })
}

export function formatDate(date: Date, formatStr: string = 'MMM d, yyyy'): string {
  return format(date, formatStr)
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
