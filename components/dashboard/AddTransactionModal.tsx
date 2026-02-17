'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Account } from '@/types'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'
import { X } from 'lucide-react'

interface AddTransactionModalProps {
  userId: string
  prefilledDate?: string
  onClose: () => void
  onUpdate: () => void
}

export default function AddTransactionModal({ userId, prefilledDate, onClose, onUpdate }: AddTransactionModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  const [accountId, setAccountId] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(prefilledDate || new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<string>('monthly')

  const expenseCategories = [
    'Rent/Mortgage', 'Utilities', 'Groceries', 'Transportation',
    'Insurance', 'Healthcare', 'Entertainment', 'Dining Out',
    'Shopping', 'Subscriptions', 'Other'
  ]

  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Gift', 'Other'
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
    if (!accountId) return

    setLoading(true)

    try {
      // Insert transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          account_id: accountId,
          type,
          category,
          amount: parseFloat(amount),
          description,
          date,
          is_recurring: isRecurring,
          recurrence_frequency: isRecurring ? recurrenceFrequency : null
        })

      if (transactionError) throw transactionError

      // Update account balance
      const selectedAccount = accounts.find(a => a.id === accountId)
      if (selectedAccount) {
        const balanceChange = type === 'income'
          ? parseFloat(amount)
          : -parseFloat(amount)

        const newBalance = parseFloat(selectedAccount.current_balance.toString()) + balanceChange

        const { error: balanceError } = await supabase
          .from('accounts')
          .update({
            current_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', accountId)

        if (balanceError) throw balanceError
      }

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error adding transaction: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${ds.text.primary}`}>Add Transaction</h2>
            <button onClick={onClose} className={ds.button.ghost}>
              <X size={24} />
            </button>
          </div>
          <div className={`text-center py-8 ${ds.text.secondary}`}>
            <p className="mb-4">No accounts found</p>
            <p className="text-sm">You need to create an account first before adding transactions.</p>
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
          <h2 className={`text-2xl font-bold ${ds.text.primary}`}>Add Transaction</h2>
          <button onClick={onClose} className={ds.button.ghost}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('expense')
                  setCategory('')
                }}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  type === 'expense'
                    ? 'bg-red-600 text-white'
                    : `${ds.bg.surface} ${ds.text.primary} ${ds.bg.hover}`
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income')
                  setCategory('')
                }}
                className={`py-3 px-4 rounded-lg font-medium transition ${
                  type === 'income'
                    ? 'bg-green-600 text-white'
                    : `${ds.bg.surface} ${ds.text.primary} ${ds.bg.hover}`
                }`}
              >
                Income
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

          {/* Category */}
          <div>
            <label htmlFor="category" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={ds.input.select}
              required
            >
              <option value="">Select category</option>
              {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
              placeholder="e.g., Electric bill, Paycheck"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={ds.input.base}
              required
            />
          </div>

          {/* Recurring */}
          <div className={`${ds.divider} pt-6`}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className={ds.input.checkbox}
              />
              <span className={`text-sm font-medium ${ds.text.label}`}>
                This is a recurring transaction
              </span>
            </label>

            {isRecurring && (
              <div className="mt-4">
                <label htmlFor="frequency" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={recurrenceFrequency}
                  onChange={(e) => setRecurrenceFrequency(e.target.value)}
                  className={ds.input.select}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

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
              {loading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
