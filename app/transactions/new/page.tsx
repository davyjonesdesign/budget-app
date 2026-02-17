'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Account } from '@/types'
import { ds } from '@/lib/design-system'

function NewTransactionForm() {
  const [user, setUser] = useState<any>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledDate = searchParams.get('date')

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
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    loadAccounts(currentUser.id)
  }

  const loadAccounts = async (userId: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !accountId) return

    setLoading(true)

    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: accountId,
          type,
          category,
          amount: parseFloat(amount),
          description,
          date,
          is_recurring: isRecurring,
          recurrence_frequency: isRecurring ? recurrenceFrequency : null,
        })

      if (transactionError) throw transactionError

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

      router.push('/dashboard')
    } catch (error: any) {
      alert('Error adding transaction: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className={`min-h-screen ${ds.bg.page} flex items-center justify-center px-4`}>
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className={`text-xl font-semibold ${ds.text.primary} mb-4`}>No Accounts Found</h2>
          <p className={`${ds.text.secondary} mb-6`}>You need to create an account first.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={ds.bg.page}>
      <header className={`${ds.bg.header} shadow-sm`}>
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={ds.button.ghost}
            >
              ← Back
            </button>
            <h1 className={`text-2xl font-bold ${ds.text.primary}`}>Add Transaction</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <Card>
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
                onClick={() => router.back()}
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
        </Card>
      </main>
    </div>
  )
}

// Wrap in Suspense to fix prerender error
export default function NewTransactionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    }>
      <NewTransactionForm />
    </Suspense>
  )
}