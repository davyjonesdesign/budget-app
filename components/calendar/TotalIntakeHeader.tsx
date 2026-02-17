'use client'

import { formatCurrency } from '@/lib/utils/date'
import { ds } from '@/lib/design-system'
import { ArrowRight } from 'lucide-react'

interface TotalIntakeHeaderProps {
  totalMonthlyIncome: number
  currentBalance: number
  monthName: string
  year: number
}

export default function TotalIntakeHeader({
  totalMonthlyIncome,
  currentBalance,
  monthName,
  year
}: TotalIntakeHeaderProps) {
  return (
    <div className={`${ds.bg.card} rounded-lg p-6 mb-6 border-t-4 border-blue-600`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight size={24} className="text-blue-600" />
            <h2 className={`text-lg ${ds.text.secondary}`}>Total Intake</h2>
          </div>
          <div className={`text-4xl font-bold ${ds.text.primary}`}>
            {formatCurrency(totalMonthlyIncome)}
          </div>
          <div className={`text-sm ${ds.text.secondary} mt-1`}>
            Expected income for {monthName} {year}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm ${ds.text.secondary} mb-1`}>Current Balance</div>
          <div className={`text-2xl font-bold ${
            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(currentBalance)}
          </div>
        </div>
      </div>
    </div>
  )
}
