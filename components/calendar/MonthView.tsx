'use client'

import { Transaction, Account } from '@/types'
import { formatCurrency } from '@/lib/utils/date'
import { getMonthTransactions, calculateRunningBalance } from '@/lib/utils/calendar'
import { ds } from '@/lib/design-system'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthViewProps {
  transactions: Transaction[]
  accounts: Account[]
  currentMonth: number
  currentYear: number
  onMonthChange: (year: number, month: number) => void
}

export default function MonthView({
  transactions,
  accounts,
  currentMonth,
  currentYear,
  onMonthChange
}: MonthViewProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11)
    } else {
      onMonthChange(currentYear, currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0)
    } else {
      onMonthChange(currentYear, currentMonth + 1)
    }
  }

  const monthTransactions = getMonthTransactions(transactions, currentYear, currentMonth)
  const primaryAccount = accounts[0] // Use first account for balance calculation
  const initialBalance = primaryAccount ? parseFloat(primaryAccount.current_balance.toString()) : 0

  const getTransactionsForDate = (dateStr: string) => {
    return monthTransactions.filter(t => t.date === dateStr)
  }

  const getBalanceForDate = (dateStr: string) => {
    return calculateRunningBalance(monthTransactions, initialBalance, dateStr)
  }

  const isPayday = (dateStr: string) => {
    return monthTransactions.some(t =>
      t.date === dateStr && t.type === 'income' && t.is_recurring && t.recurrence_frequency === 'biweekly'
    )
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`min-h-[120px] ${ds.bg.surface} opacity-50`}></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayTransactions = getTransactionsForDate(dateStr)
      const balance = getBalanceForDate(dateStr)
      const isToday = new Date().toDateString() === new Date(dateStr).toDateString()
      const isPaydayDate = isPayday(dateStr)

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border ${ds.border.light} p-2 ${
            isToday ? 'ring-2 ring-blue-500' : ''
          } ${isPaydayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ds.bg.card}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold ${ds.text.primary}`}>{day}</span>
            {dayTransactions.length > 0 && (
              <span className={`text-xs font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {dayTransactions.slice(0, 3).map((t, idx) => (
              <div
                key={idx}
                className={`text-xs p-1 rounded ${
                  t.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}
              >
                <div className="font-medium truncate">{t.category}</div>
                <div className="font-bold">
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount.toString()))}
                </div>
              </div>
            ))}
            {dayTransactions.length > 3 && (
              <div className={`text-xs ${ds.text.secondary} text-center`}>
                +{dayTransactions.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${ds.text.primary}`}>
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className={`p-2 rounded ${ds.button.secondary}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className={`p-2 rounded ${ds.button.secondary}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`${ds.bg.card} rounded-lg ${ds.shadow.md} p-4`}>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center font-semibold ${ds.text.secondary} text-sm py-2`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded"></div>
              <span className={ds.text.secondary}>Payday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className={ds.text.secondary}>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
              <span className={ds.text.secondary}>Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-blue-500 rounded"></div>
              <span className={ds.text.secondary}>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
