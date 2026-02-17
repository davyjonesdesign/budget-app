import React from 'react'
import { ds } from '@/lib/design-system'
import { Wallet, PiggyBank } from 'lucide-react'

interface BalanceCardProps {
  checkingBalance: number
  savingsBalance: number
  formatCurrency: (amount: number) => string
}

export default function BalanceCard({ checkingBalance, savingsBalance, formatCurrency }: BalanceCardProps) {
  const totalBalance = checkingBalance + savingsBalance

  return (
    <div className={`${ds.bg.card} rounded-lg p-6 mb-6 border-l-4 border-blue-600 dark:border-blue-500 ${ds.shadow.md}`}>
      {/* Total Balance */}
      <div className="mb-6">
        <div className={`text-sm font-medium ${ds.text.secondary} mb-1`}>
          Total Balance
        </div>
        <div className={`text-4xl font-bold ${
          totalBalance >= 0
            ? 'text-gray-900 dark:text-white'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatCurrency(totalBalance)}
        </div>
      </div>

      {/* Checking & Savings Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Checking */}
        <div className={`${ds.bg.surface} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className={ds.text.secondary} />
            <span className={`text-xs font-medium ${ds.text.secondary} uppercase tracking-wide`}>
              Checking
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            checkingBalance >= 0
              ? ds.text.primary
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(checkingBalance)}
          </div>
        </div>

        {/* Savings */}
        <div className={`${ds.bg.surface} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank size={18} className={ds.text.secondary} />
            <span className={`text-xs font-medium ${ds.text.secondary} uppercase tracking-wide`}>
              Savings
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            savingsBalance >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(savingsBalance)}
          </div>
        </div>
      </div>
    </div>
  )
}
