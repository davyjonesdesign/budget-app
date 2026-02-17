'use client'

import { useState } from 'react'
import { Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils/date'
import { ds } from '@/lib/design-system'
import { Receipt, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface MonthliesSidebarProps {
  recurringBills: Transaction[]
  totalMonthlyExpenses: number
  givingGoalAmount?: number
}

export default function MonthliesSidebar({
  recurringBills,
  totalMonthlyExpenses,
  givingGoalAmount
}: MonthliesSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const categories = [
    { name: 'Rent', bills: recurringBills.filter(b => b.category.toLowerCase().includes('rent')) },
    { name: 'Bills', bills: recurringBills.filter(b =>
      ['utilities', 'electric', 'gas', 'water', 'internet', 'phone', 'comcast', 'nipsco'].some(term =>
        b.category.toLowerCase().includes(term)
      )
    )},
    { name: 'Groceries', bills: recurringBills.filter(b => b.category.toLowerCase().includes('groceries')) },
    { name: 'Gas', bills: recurringBills.filter(b => b.category.toLowerCase().includes('gas') && !b.category.toLowerCase().includes('nipsco')) },
    { name: 'Debt', bills: recurringBills.filter(b =>
      ['debt', 'loan', 'credit', 'discover', 'usaa'].some(term =>
        b.category.toLowerCase().includes(term)
      )
    )},
    { name: 'Savings', bills: recurringBills.filter(b => b.category.toLowerCase().includes('savings')) },
    { name: 'Misc', bills: recurringBills.filter(b =>
      !['rent', 'utilities', 'electric', 'gas', 'water', 'internet', 'phone', 'groceries', 'debt', 'loan', 'credit', 'savings', 'comcast', 'nipsco', 'discover', 'usaa'].some(term =>
        b.category.toLowerCase().includes(term)
      )
    )}
  ]

  return (
    <div className={`${ds.bg.card} rounded-lg p-4 border-2 border-red-600 dark:border-red-500 lg:sticky lg:top-4`}>
      <div
        className="flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className={`font-bold ${ds.text.primary} flex items-center gap-2`}>
            <Receipt size={20} />
            Monthly Expenses
          </h3>
          <button className="lg:hidden">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg text-red-600 dark:text-red-400`}>
            {formatCurrency(totalMonthlyExpenses + (givingGoalAmount || 0))}
          </span>
          {isExpanded && (
            <Link href="/bills" className="hidden lg:block">
              <button className={`${ds.text.secondary} hover:${ds.text.primary} transition`}>
                <Plus size={18} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="space-y-3 mt-4">
            {categories.map(category => {
              const total = category.bills.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0)
              if (total === 0) return null

              return (
                <div key={category.name} className={`pb-2 border-b ${ds.border.light} last:border-0`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${ds.text.secondary}`}>
                      {category.name}:
                    </span>
                    <span className={`font-semibold ${ds.text.primary}`}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {category.bills.length > 1 && (
                    <div className="mt-1 ml-2 space-y-1">
                      {category.bills.map(bill => (
                        <div key={bill.id} className="flex justify-between text-xs">
                          <span className={ds.text.secondary}>{bill.category}</span>
                          <span className={ds.text.secondary}>
                            {formatCurrency(parseFloat(bill.amount.toString()))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {givingGoalAmount && (
              <div className={`pt-3 border-t-2 ${ds.border.default}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium text-green-600 dark:text-green-400`}>
                    Giving:
                  </span>
                  <span className={`font-bold text-green-600 dark:text-green-400`}>
                    {formatCurrency(givingGoalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link href="/bills" className="lg:hidden">
            <button className={`w-full mt-4 py-2 ${ds.button.secondary} flex items-center justify-center gap-2`}>
              <Plus size={18} />
              Add Bill
            </button>
          </Link>
        </>
      )}
    </div>
  )
}
