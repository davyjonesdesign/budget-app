'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { Transaction, Account, SavingsGoal } from '@/types'

interface User {
  id: string
  [key: string]: any
}
import { getDayListData, getMonthTransactions } from '@/lib/utils/calendar'
import DayListView from '@/components/calendar/DayListView'
import MonthliesSidebar from '@/components/calendar/MonthliesSidebar'
import TotalIntakeHeader from '@/components/calendar/TotalIntakeHeader'
import ExtraConsiderations from '@/components/calendar/ExtraConsiderations'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react'
import AddTransactionModal from '@/components/dashboard/AddTransactionModal'


export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  // Start at current month
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const router = useRouter()

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
    loadData(currentUser.id)
  }

  const loadData = async(userId: string) => {
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)

      if (accountsError) throw accountsError
      setAccounts(accountsData || [])

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)

      if (goalsError) throw goalsError
      setSavingsGoals(goalsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(now.getMonth())
    setCurrentYear(now.getFullYear())
  }

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear()

// Update handleAddTransaction
const handleAddTransaction = (date: string) => {
  setSelectedDate(date)
  setShowTransactionModal(true)
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-lg ${ds.text.secondary}`}>Loading...</div>
      </div>
    )
  }

  const primaryAccount = accounts[0]
  const initialBalance = primaryAccount ? parseFloat(primaryAccount.current_balance.toString()) : 0
  const dayListData = getDayListData(transactions, currentYear, currentMonth, initialBalance)
  const monthTransactions = getMonthTransactions(transactions, currentYear, currentMonth)

  const monthlyIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)

  const recurringBills = transactions.filter(t =>
    t.type === 'expense' && t.is_recurring && t.recurrence_frequency === 'monthly'
  )

  const totalMonthlyExpenses = recurringBills
    .reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0)

  const givingGoal = savingsGoals.find(g => g.name.toLowerCase() === 'giving')
  const monthlyGiving = givingGoal ? givingGoal.target_amount / 12 : 0

  return (
    <div className={ds.bg.page}>
      <header className={`${ds.bg.header} shadow-sm sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className={ds.button.ghost}
              >
                ← Back
              </button>
              <h1 className={`text-2xl font-bold ${ds.text.primary} flex items-center gap-2`}>
                <img src="/logo.svg" alt="Budgety logo" className="h-8 w-8" />
                <span>Budgety Calendar</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className={`${ds.bg.surface} rounded-lg p-1 flex gap-1`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'list'
                      ? `${ds.bg.card} ${ds.text.primary} shadow`
                      : ds.text.secondary
                  }`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'grid'
                      ? `${ds.bg.card} ${ds.text.primary} shadow`
                      : ds.text.secondary
                  }`}
                >
                  <CalendarIcon size={18} />
                </button>
              </div>
              <Button onClick={() => router.push('/transactions/new')}>
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {/* Month Navigation - Sticky */}
        <div className={`sticky top-[73px] ${ds.bg.page} pb-4 z-30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className={`p-2 rounded ${ds.button.secondary}`}
                title="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className={`text-2xl font-bold ${ds.text.primary} min-w-[200px] text-center`}>
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className={`p-2 rounded ${ds.button.secondary}`}
                title="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            {!isCurrentMonth && (
              <Button size="sm" onClick={goToToday}>
                Today
              </Button>
            )}
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Total Intake Header */}
            <TotalIntakeHeader
              totalMonthlyIncome={monthlyIncome}
              currentBalance={initialBalance}
              monthName={monthNames[currentMonth]}
              year={currentYear}
            />

            {/* Two column layout: Day list + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Day List - Takes 2 columns */}
              <div className="lg:col-span-2">
                <DayListView
                  dayListData={dayListData}
                  onAddTransaction={handleAddTransaction}
                />
              </div>

              {/* Sidebar - Takes 1 column */}
              <div className="lg:col-span-1 space-y-4">
                <MonthliesSidebar
                  recurringBills={recurringBills}
                  totalMonthlyExpenses={totalMonthlyExpenses}
                  givingGoalAmount={monthlyGiving}
                />

                <ExtraConsiderations savingsGoals={savingsGoals} />
              </div>
            </div>
          </>
        ) : (
          <div className={`${ds.bg.card} rounded-lg p-8 text-center`}>
            <CalendarIcon size={48} className={`mx-auto mb-4 ${ds.text.secondary}`} />
            <h3 className={`text-xl font-semibold ${ds.text.primary} mb-2`}>
              Grid View Coming Soon
            </h3>
            <p className={ds.text.secondary}>
              For now, try the list view - it matches your paper budget!
            </p>
          </div>
        )}
      </main>
      {showTransactionModal && user && (
        <AddTransactionModal
          userId={user.id}
          prefilledDate={selectedDate}
          onClose={() => {
            setShowTransactionModal(false)
            setSelectedDate('')
          }}
          onUpdate={() => loadData(user.id)}
        />
      )}
    </div>
  )
}
