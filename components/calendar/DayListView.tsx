'use client'

import { useState } from 'react'
import { Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils/date'
import { ds } from '@/lib/design-system'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'

interface DayListViewProps {
  dayListData: Array<{
    day: number
    date: string
    transactions: Transaction[]
    endingBalance: number
    isToday: boolean
    isPayday: boolean
  }>
  onAddTransaction: (date: string) => void
}

export default function DayListView({ dayListData, onAddTransaction }: DayListViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(day)) {
      newExpanded.delete(day)
    } else {
      newExpanded.add(day)
    }
    setExpandedDays(newExpanded)
  }

  return (
    <div className="space-y-1">
      {dayListData.map(({ day, date, transactions, endingBalance, isToday, isPayday }) => {
        const isExpanded = expandedDays.has(day)
        const hasTransactions = transactions.length > 0
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

        return (
          <div
            key={day}
            className={`${ds.bg.card} border-l-4 ${
              isToday
                ? 'border-blue-600 ring-2 ring-blue-500 ring-opacity-50'
                : isPayday
                ? 'border-green-600'
                : hasTransactions
                ? 'border-orange-400'
                : ds.border.light
            } transition-all`}
          >
            {/* Day header - always visible */}
            <div
              className={`flex items-center justify-between p-3 cursor-pointer ${
                hasTransactions ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''
              }`}
              onClick={() => hasTransactions && toggleDay(day)}
            >
              <div className="flex items-center gap-3">
                {/* Day number */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : isPayday
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : `${ds.bg.surface} ${ds.text.primary}`
                  }`}
                >
                  {day}
                </div>

                {/* Quick transaction summary */}
                <div className="flex gap-2">
                  {totalIncome > 0 && (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-semibold">
                      +{formatCurrency(totalIncome)}
                    </div>
                  )}
                  {totalExpense > 0 && (
                    <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-semibold">
                      -{formatCurrency(totalExpense)}
                    </div>
                  )}
                  {!hasTransactions && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddTransaction(date)
                      }}
                      className={`flex items-center gap-1 px-2 py-1 ${ds.text.secondary} hover:${ds.text.primary} text-xs transition`}
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Ending balance */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-xs ${ds.text.secondary}`}>Balance</div>
                  <div className={`font-bold text-lg ${
                    endingBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(endingBalance)}
                  </div>
                </div>
                {hasTransactions && (
                  <button className={ds.text.secondary}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>
            </div>

            {/* Transaction details - expandable */}
            {isExpanded && hasTransactions && (
              <div className={`px-3 pb-3 space-y-2 border-t ${ds.border.light}`}>
                {transactions.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded ${
                      t.type === 'income'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`font-medium ${ds.text.primary}`}>{t.category}</div>
                      {t.description && (
                        <div className={`text-sm ${ds.text.secondary}`}>{t.description}</div>
                      )}
                      {t.is_recurring && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          🔁 {t.recurrence_frequency}
                        </div>
                      )}
                    </div>
                    <div className={`font-bold ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseFloat(t.amount.toString()))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onAddTransaction(date)}
                  className={`w-full py-2 text-sm ${ds.text.secondary} hover:${ds.text.primary} transition flex items-center justify-center gap-1`}
                >
                  <Plus size={16} />
                  Add transaction for this day
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
