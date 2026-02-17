'use client'

import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/date'
import { getUpcomingBills } from '@/lib/utils/calendar'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ds } from '@/lib/design-system'
import { Bell, Calendar } from 'lucide-react'

interface UpcomingBillsProps {
  transactions: Transaction[]
}

export default function UpcomingBills({ transactions }: UpcomingBillsProps) {
  const upcomingBills = getUpcomingBills(transactions, 7)

  if (upcomingBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Bell size={20} />
              Upcoming Bills
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${ds.text.secondary} text-center py-4`}>No bills due in the next 7 days</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Bell size={20} />
            Upcoming Bills
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingBills.map((bill, idx) => {
            const daysUntil = Math.ceil(
              (new Date(bill.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div
                key={`${bill.id}-${idx}`}
                className={`flex items-center justify-between p-3 rounded-lg ${ds.bg.surface}`}
              >
                <div className="flex-1">
                  <div className={`font-medium ${ds.text.primary}`}>{bill.category}</div>
                  <div className={`text-sm ${ds.text.secondary} flex items-center gap-1`}>
                    <Calendar size={14} />
                    {formatDate(new Date(bill.date), 'MMM d')}
                    {daysUntil === 0 && ' • Today'}
                    {daysUntil === 1 && ' • Tomorrow'}
                    {daysUntil > 1 && ` • In ${daysUntil} days`}
                  </div>
                </div>
                <div className="font-bold text-red-600">
                  {formatCurrency(parseFloat(bill.amount.toString()))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
