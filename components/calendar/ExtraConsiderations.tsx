'use client'

import { useState } from 'react'
import { SavingsGoal } from '@/types'
import { formatCurrency } from '@/lib/utils/date'
import { ds } from '@/lib/design-system'
import { Target, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface ExtraConsiderationsProps {
  savingsGoals: SavingsGoal[]
}

export default function ExtraConsiderations({ savingsGoals }: ExtraConsiderationsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const totalGoals = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0)
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0)

  return (
    <div className={`${ds.bg.card} rounded-lg p-4 border-2 border-purple-600 dark:border-purple-500`}>
      <div
        className="flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className={`font-bold ${ds.text.primary} flex items-center gap-2`}>
            <Target size={20} />
            Extra Considerations
          </h3>
          <button className="lg:hidden">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg text-purple-600 dark:text-purple-400`}>
            {formatCurrency(totalSaved)} / {formatCurrency(totalGoals)}
          </span>
          {isExpanded && (
            <Link href="/goals" className="hidden lg:block">
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
            {savingsGoals.length === 0 ? (
              <p className={`text-sm ${ds.text.secondary} text-center py-4`}>
                No savings goals yet
              </p>
            ) : (
              savingsGoals.map(goal => {
                const progress = (goal.current_amount / goal.target_amount) * 100
                const colorMap = {
                  blue: 'bg-blue-600',
                  green: 'bg-green-600',
                  purple: 'bg-purple-600',
                  orange: 'bg-orange-600',
                  red: 'bg-red-600'
                }

                return (
                  <div key={goal.id} className={`pb-3 border-b ${ds.border.light} last:border-0`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${ds.text.primary}`}>
                        {goal.name}
                      </span>
                      <span className={`text-sm font-semibold ${ds.text.primary}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`w-full ${ds.bg.surface} rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full ${colorMap[goal.color]} transition-all`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className={`text-xs ${ds.text.secondary} mt-1`}>
                      {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <Link href="/goals" className="lg:hidden">
            <button className={`w-full mt-4 py-2 ${ds.button.secondary} flex items-center justify-center gap-2`}>
              <Plus size={18} />
              Add Goal
            </button>
          </Link>
        </>
      )}
    </div>
  )
}
