'use client'

import { useState } from 'react'
import { ds } from '@/lib/design-system'
import { DollarSign, Receipt, Target, Wallet, X } from 'lucide-react'
import AddTransactionModal from './AddTransactionModal'
import AddRecurringBillModal from './AddRecurringBillModal'
import AddAccountModal from './AddAccountModal'

interface UnifiedActionModalProps {
  userId: string
  onClose: () => void
  onUpdate: () => void
}

export default function UnifiedActionModal({ userId, onClose, onUpdate }: UnifiedActionModalProps) {
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showBillModal, setShowBillModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  if (showTransactionModal) {
    return (
      <AddTransactionModal
        userId={userId}
        onClose={() => {
          setShowTransactionModal(false)
          onClose()
        }}
        onUpdate={onUpdate}
      />
    )
  }

  if (showBillModal) {
    return (
      <AddRecurringBillModal
        userId={userId}
        onClose={() => {
          setShowBillModal(false)
          onClose()
        }}
        onUpdate={onUpdate}
      />
    )
  }

  if (showAccountModal) {
    return (
      <AddAccountModal
        userId={userId}
        onClose={() => {
          setShowAccountModal(false)
          onClose()
        }}
        onUpdate={onUpdate}
      />
    )
  }

  const actions = [
    {
      icon: DollarSign,
      title: 'Add Transaction',
      description: 'One-time income or expense',
      color: 'blue',
      onClick: () => setShowTransactionModal(true)
    },
    {
      icon: Receipt,
      title: 'Add Recurring Bill',
      description: 'Monthly or yearly expense',
      color: 'red',
      onClick: () => setShowBillModal(true)
    },
    {
      icon: Target,
      title: 'Add Savings Goal',
      description: 'Track progress toward a goal',
      color: 'green',
      href: '/goals'
    },
    {
      icon: Wallet,
      title: 'Add Account',
      description: 'Checking or savings account',
      color: 'purple',
      onClick: () => setShowAccountModal(true)
    }
  ]

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${ds.bg.card} rounded-lg max-w-2xl w-full p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${ds.text.primary}`}>What would you like to add?</h2>
          <button onClick={onClose} className={ds.button.ghost}>
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, idx) => {
            if (action.href) {
              return (
                <a
                  key={idx}
                  href={action.href}
                  className={`p-6 rounded-lg border-2 transition text-left ${colorMap[action.color as keyof typeof colorMap]}`}
                >
                  <action.icon size={32} className={`mb-3 ${ds.text.primary}`} />
                  <h3 className={`text-lg font-semibold ${ds.text.primary} mb-1`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm ${ds.text.secondary}`}>
                    {action.description}
                  </p>
                </a>
              )
            }

            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-6 rounded-lg border-2 transition text-left ${colorMap[action.color as keyof typeof colorMap]}`}
              >
                <action.icon size={32} className={`mb-3 ${ds.text.primary}`} />
                <h3 className={`text-lg font-semibold ${ds.text.primary} mb-1`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${ds.text.secondary}`}>
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
