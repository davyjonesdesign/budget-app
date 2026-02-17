'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { Transaction } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ds } from '@/lib/design-system'
import { Plus, Edit2, Trash2, Calendar, Receipt } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/date'

export default function BillsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [monthlyBills, setMonthlyBills] = useState<Transaction[]>([])
  const [yearlyExpenses, setYearlyExpenses] = useState<Transaction[]>([])
  const [showMonthlyModal, setShowMonthlyModal] = useState(false)
  const [showYearlyModal, setShowYearlyModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Transaction | null>(null)
  const router = useRouter()

  const [monthlyForm, setMonthlyForm] = useState({
    category: '',
    amount: '',
    day: '1',
    description: ''
  })

  const [yearlyForm, setYearlyForm] = useState({
    category: '',
    amount: '',
    month: '0',
    day: '1',
    description: ''
  })

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async() => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    loadBills(currentUser.id)
  }

  const loadBills = async(userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('is_recurring', true)
        .order('category', { ascending: true })

      if (error) throw error

      const monthly = (data || []).filter(t => t.recurrence_frequency === 'monthly')
      const yearly = (data || []).filter(t => t.recurrence_frequency === 'yearly')

      setMonthlyBills(monthly)
      setYearlyExpenses(yearly)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthlySubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      // Get first account for bill
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!accounts || accounts.length === 0) {
        alert('Please create an account first')
        return
      }

      const billDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${monthlyForm.day.padStart(2, '0')}`

      if (editingBill) {
        const { error } = await supabase
          .from('transactions')
          .update({
            category: monthlyForm.category,
            amount: parseFloat(monthlyForm.amount),
            description: monthlyForm.description,
            date: billDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBill.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: accounts[0].id,
            type: 'expense',
            category: monthlyForm.category,
            amount: parseFloat(monthlyForm.amount),
            description: monthlyForm.description,
            date: billDate,
            is_recurring: true,
            recurrence_frequency: 'monthly'
          })

        if (error) throw error
      }

      setMonthlyForm({ category: '', amount: '', day: '1', description: '' })
      setEditingBill(null)
      setShowMonthlyModal(false)
      loadBills(user.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error saving bill: ' + message)
    }
  }

  const handleYearlySubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!accounts || accounts.length === 0) {
        alert('Please create an account first')
        return
      }

      const expenseDate = `${new Date().getFullYear()}-${String(parseInt(yearlyForm.month) + 1).padStart(2, '0')}-${yearlyForm.day.padStart(2, '0')}`

      if (editingBill) {
        const { error } = await supabase
          .from('transactions')
          .update({
            category: yearlyForm.category,
            amount: parseFloat(yearlyForm.amount),
            description: yearlyForm.description,
            date: expenseDate,
            yearly_month: parseInt(yearlyForm.month),
            yearly_day: parseInt(yearlyForm.day),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBill.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: accounts[0].id,
            type: 'expense',
            category: yearlyForm.category,
            amount: parseFloat(yearlyForm.amount),
            description: yearlyForm.description,
            date: expenseDate,
            is_recurring: true,
            recurrence_frequency: 'yearly',
            yearly_month: parseInt(yearlyForm.month),
            yearly_day: parseInt(yearlyForm.day)
          })

        if (error) throw error
      }

      setYearlyForm({ category: '', amount: '', month: '0', day: '1', description: '' })
      setEditingBill(null)
      setShowYearlyModal(false)
      loadBills(user.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error saving expense: ' + message)
    }
  }

  const handleEdit = (bill: Transaction, type: 'monthly' | 'yearly') => {
    setEditingBill(bill)
    const billDate = new Date(bill.date)

    if (type === 'monthly') {
      setMonthlyForm({
        category: bill.category,
        amount: bill.amount.toString(),
        day: billDate.getDate().toString(),
        description: bill.description || ''
      })
      setShowMonthlyModal(true)
    } else {
      setYearlyForm({
        category: bill.category,
        amount: bill.amount.toString(),
        month: (bill.yearly_month || billDate.getMonth()).toString(),
        day: (bill.yearly_day || billDate.getDate()).toString(),
        description: bill.description || ''
      })
      setShowYearlyModal(true)
    }
  }

  const handleDelete = async(billId: string) => {
    if (!confirm('Delete this recurring bill?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', billId)

      if (error) throw error
      if (user) loadBills(user.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error deleting bill: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-lg ${ds.text.secondary}`}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={ds.bg.page}>
      <header className={`${ds.bg.header} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className={ds.button.ghost}>
              ← Back
            </button>
            <h1 className={`text-2xl font-bold ${ds.text.primary}`}>Recurring Bills</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
        {/* Monthly Bills */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${ds.text.primary} flex items-center gap-2`}>
              <Calendar size={24} />
              Monthly Bills
            </h2>
            <Button onClick={() => setShowMonthlyModal(true)}>
              <Plus size={18} className="mr-2" />
              Add Bill
            </Button>
          </div>

          {monthlyBills.length === 0 ? (
            <p className={`text-center py-8 ${ds.text.secondary}`}>No monthly bills yet</p>
          ) : (
            <div className="space-y-2">
              {monthlyBills.map(bill => {
                const dayOfMonth = new Date(bill.date).getDate()
                return (
                  <div
                    key={bill.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${ds.bg.surface}`}
                  >
                    <div className="flex-1">
                      <div className={`font-medium ${ds.text.primary}`}>{bill.category}</div>
                      <div className={`text-sm ${ds.text.secondary}`}>
                        Due: Day {dayOfMonth} of each month
                        {bill.description && ` • ${bill.description}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-bold text-lg ${ds.text.primary}`}>
                        {formatCurrency(parseFloat(bill.amount.toString()))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bill, 'monthly')}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Yearly Expenses */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${ds.text.primary} flex items-center gap-2`}>
              <Receipt size={24} />
              Yearly Expenses
            </h2>
            <Button onClick={() => setShowYearlyModal(true)} variant="secondary">
              <Plus size={18} className="mr-2" />
              Add Yearly Expense
            </Button>
          </div>

          {yearlyExpenses.length === 0 ? (
            <p className={`text-center py-8 ${ds.text.secondary}`}>No yearly expenses yet</p>
          ) : (
            <div className="space-y-2">
              {yearlyExpenses.map(expense => {
                const month = expense.yearly_month ?? new Date(expense.date).getMonth()
                const day = expense.yearly_day ?? new Date(expense.date).getDate()
                return (
                  <div
                    key={expense.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${ds.bg.surface}`}
                  >
                    <div className="flex-1">
                      <div className={`font-medium ${ds.text.primary}`}>{expense.category}</div>
                      <div className={`text-sm ${ds.text.secondary}`}>
                        {monthNames[month]} {day} each year
                        {expense.description && ` • ${expense.description}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-bold text-lg ${ds.text.primary}`}>
                        {formatCurrency(parseFloat(expense.amount.toString()))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense, 'yearly')}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </main>

      {/* Monthly Bill Modal */}
      {showMonthlyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
            <h2 className={`text-2xl font-bold ${ds.text.primary} mb-4`}>
              {editingBill ? 'Edit Monthly Bill' : 'New Monthly Bill'}
            </h2>

            <form onSubmit={handleMonthlySubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Bill Name
                </label>
                <input
                  type="text"
                  value={monthlyForm.category}
                  onChange={e => setMonthlyForm({ ...monthlyForm, category: e.target.value })}
                  className={ds.input.base}
                  placeholder="Rent, Electric, Internet..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyForm.amount}
                    onChange={e => setMonthlyForm({ ...monthlyForm, amount: e.target.value })}
                    className={`${ds.input.base} pl-8`}
                    placeholder="100.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Day of Month
                </label>
                <select
                  value={monthlyForm.day}
                  onChange={e => setMonthlyForm({ ...monthlyForm, day: e.target.value })}
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

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={monthlyForm.description}
                  onChange={e => setMonthlyForm({ ...monthlyForm, description: e.target.value })}
                  className={ds.input.base}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowMonthlyModal(false)
                    setEditingBill(null)
                    setMonthlyForm({ category: '', amount: '', day: '1', description: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBill ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yearly Expense Modal */}
      {showYearlyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
            <h2 className={`text-2xl font-bold ${ds.text.primary} mb-4`}>
              {editingBill ? 'Edit Yearly Expense' : 'New Yearly Expense'}
            </h2>

            <form onSubmit={handleYearlySubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Expense Name
                </label>
                <input
                  type="text"
                  value={yearlyForm.category}
                  onChange={e => setYearlyForm({ ...yearlyForm, category: e.target.value })}
                  className={ds.input.base}
                  placeholder="Birthday Gift, Insurance..."
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={yearlyForm.amount}
                    onChange={e => setYearlyForm({ ...yearlyForm, amount: e.target.value })}
                    className={`${ds.input.base} pl-8`}
                    placeholder="500.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                    Month
                  </label>
                  <select
                    value={yearlyForm.month}
                    onChange={e => setYearlyForm({ ...yearlyForm, month: e.target.value })}
                    className={ds.input.select}
                    required
                  >
                    {monthNames.map((month, idx) => (
                      <option key={idx} value={idx}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                    Day
                  </label>
                  <select
                    value={yearlyForm.day}
                    onChange={e => setYearlyForm({ ...yearlyForm, day: e.target.value })}
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
              </div>

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={yearlyForm.description}
                  onChange={e => setYearlyForm({ ...yearlyForm, description: e.target.value })}
                  className={ds.input.base}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowYearlyModal(false)
                    setEditingBill(null)
                    setYearlyForm({ category: '', amount: '', month: '0', day: '1', description: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBill ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
