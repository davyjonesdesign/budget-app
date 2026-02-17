'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Account } from '@/types'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'
import { X } from 'lucide-react'

interface AddRecurringBillModalProps {
  userId: string
  onClose: () => void
  onUpdate: () => void
}

export default function AddRecurringBillModal({ userId, onClose, onUpdate }: AddRecurringBillModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [billType, setBillType] = useState<'monthly' | 'yearly'>('monthly')

  // Form state
  const [accountId, setAccountId] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  // Monthly bill
  const [dayOfMonth, setDayOfMonth] = useState('1')

  // Yearly bill
  const [month, setMonth] = useState('0')
  const [dayOfYear, setDayOfYear] = useState('1')

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async() => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error loading accounts:', error)
      return
    }

    setAccounts(data || [])
    if (data && data.length > 0) {
      setAccountId(data[0].id)
    }
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId || !name || !amount) return

    setLoading(true)

    try {
      let billDate: string
      const today = new Date()

      if (billType === 'monthly') {
        billDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${dayOfMonth.padStart(2, '0')}`
      } else {
        billDate = `${today.getFullYear()}-${String(parseInt(month) + 1).padStart(2, '0')}-${dayOfYear.padStart(2, '0')}`
      }

      const transactionData: any = {
        user_id: userId,
        account_id: accountId,
        type: 'expense',
        category: name,
        amount: parseFloat(amount),
        description,
        date: billDate,
        is_recurring: true,
        recurrence_frequency: billType
      }

      if (billType === 'yearly') {
        transactionData.yearly_month = parseInt(month)
        transactionData.yearly_day = parseInt(dayOfYear)
      }

      const { error } = await supabase
        .from('transactions')
        .insert(transactionData)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error adding recurring bill: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${ds.text.primary}`}>Add Recurring Bill</h2>
            <button onClick={onClose} className={ds.button.ghost}>
              <X size={24} />
            </button>
          </div>
          <div className={`text-center py-8 ${ds.text.secondary}`}>
            <p className="mb-4">No accounts found</p>
            <p className="text-sm">You need to create an account first before adding bills.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${ds.bg.card} rounded-lg max-w-2xl w-full p-6 my-8`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${ds.text.primary}`}>Add Recurring Bill</h2>
          <button onClick={onClose} className={ds.button.ghost}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Type Toggle */}
          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Bill Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillType('monthly')}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  billType === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : `${ds.bg.surface} ${ds.text.primary} ${ds.bg.hover}`
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillType('yearly')}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  billType === 'yearly'
                    ? 'bg-purple-600 text-white'
                    : `${ds.bg.surface} ${ds.text.primary} ${ds.bg.hover}`
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <label htmlFor="account" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Account
            </label>
            <select
              id="account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={ds.input.select}
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bill Name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Bill Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={ds.input.base}
              placeholder="Rent, Electric, Car Insurance..."
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Amount
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${ds.input.base} pl-8`}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={ds.input.base}
              placeholder="Additional notes..."
            />
          </div>

          {/* Monthly Bill - Day of Month */}
          {billType === 'monthly' && (
            <div>
              <label htmlFor="dayOfMonth" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                Due Date (Day of Month)
              </label>
              <select
                id="dayOfMonth"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className={ds.input.select}
                required
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
              <p className={`text-xs ${ds.text.secondary} mt-1`}>
                This bill will repeat on day {dayOfMonth} of every month
              </p>
            </div>
          )}

          {/* Yearly Bill - Month and Day */}
          {billType === 'yearly' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Month
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={ds.input.select}
                  required
                >
                  {monthNames.map((monthName, idx) => (
                    <option key={idx} value={idx}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dayOfYear" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Day
                </label>
                <select
                  id="dayOfYear"
                  value={dayOfYear}
                  onChange={(e) => setDayOfYear(e.target.value)}
                  className={ds.input.select}
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <p className={`text-xs ${ds.text.secondary}`}>
                  This bill will repeat on {monthNames[parseInt(month)]} {dayOfYear} every year
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Bill'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
