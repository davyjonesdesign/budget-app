'use client'

import { useEffect, useState } from 'react'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import BalanceCard from '@/components/ui/BalanceCard'
import UpcomingBills from '@/components/dashboard/UpcomingBills'
import AddAccountModal from '@/components/dashboard/AddAccountModal'
import EditAccountModal from '@/components/dashboard/EditAccountModal'
import UnifiedActionModal from '@/components/dashboard/UnifiedActionModal'
import ThemeToggle from '@/components/ThemeToggle'
import { formatCurrency, formatDate } from '@/lib/utils/date'
import { Transaction, Account } from '@/types'
import { ds } from '@/lib/design-system'
import { Plus, Edit2, Calendar as CalendarIcon } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [checkingBalance, setCheckingBalance] = useState(0)
  const [savingsBalance, setSavingsBalance] = useState(0)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()

    // Listen for add account event from unified action modal
    const handleAddAccount = () => {
      setShowAddAccountModal(true)
    }
    window.addEventListener('add-account', handleAddAccount)
    return () => window.removeEventListener('add-account', handleAddAccount)
  }, [])

  const checkUser = async() => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    loadDashboardData(currentUser.id)
  }

  const loadDashboardData = async(userId: string) => {
    try {
      // Load accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)

      if (accountsError) throw accountsError

      setAccounts(accountsData || [])

      // Calculate checking and savings separately
      const checkingTotal = accountsData
        ?.filter(acc => acc.type === 'checking')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance.toString()), 0) || 0

      const savingsTotal = accountsData
        ?.filter(acc => acc.type === 'savings')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance.toString()), 0) || 0

      setCheckingBalance(checkingTotal)
      setSavingsBalance(savingsTotal)
      setTotalBalance(checkingTotal + savingsTotal)

      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10)

      if (transactionsError) throw transactionsError

      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async() => {
    await signOut()
    router.push('/')
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
      {/* Header */}
      <header className={`${ds.bg.header} shadow-sm sticky top-0 z-40`}>
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${ds.text.primary}`}>Budget</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* Balance Card */}
        <BalanceCard
          checkingBalance={checkingBalance}
          savingsBalance={savingsBalance}
          formatCurrency={formatCurrency}
        />

        {/* Quick Action Button - Prominent */}
        <div className="mb-6">
          <Button
            onClick={() => setShowActionModal(true)}
            className="w-full py-4 text-lg"
          >
            <Plus size={24} />
            Add Something
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/calendar">
            <button className={`w-full p-4 ${ds.bg.card} ${ds.shadow.sm} rounded-lg hover:${ds.shadow.md} transition`}>
              <CalendarIcon size={24} className={`mx-auto mb-1 ${ds.text.primary}`} />
              <div className={`text-xs font-medium ${ds.text.primary}`}>Calendar</div>
            </button>
          </Link>
          <Link href="/bills">
            <button className={`w-full p-4 ${ds.bg.card} ${ds.shadow.sm} rounded-lg hover:${ds.shadow.md} transition`}>
              <div className="text-2xl mb-1">📋</div>
              <div className={`text-xs font-medium ${ds.text.primary}`}>Bills</div>
            </button>
          </Link>
          <Link href="/goals">
            <button className={`w-full p-4 ${ds.bg.card} ${ds.shadow.sm} rounded-lg hover:${ds.shadow.md} transition`}>
              <div className="text-2xl mb-1">🎯</div>
              <div className={`text-xs font-medium ${ds.text.primary}`}>Goals</div>
            </button>
          </Link>
        </div>

        {/* Upcoming Bills */}
        <div className="mb-6">
          <UpcomingBills transactions={transactions} />
        </div>

        {/* Accounts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${ds.text.primary}`}>Accounts</h2>
            <Button size="sm" onClick={() => setShowAddAccountModal(true)}>
              <Plus size={18} />
              Add
            </Button>
          </div>

          {accounts.length === 0 ? (
            <Card>
              <div className={`text-center py-8 ${ds.text.secondary}`}>
                <p className="mb-4">No accounts yet</p>
                <Button onClick={() => setShowAddAccountModal(true)}>Create Your First Account</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <Card key={account.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${ds.text.primary}`}>{account.name}</p>
                      <p className={`text-sm ${ds.text.secondary} capitalize`}>{account.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-xl font-semibold ${
                        parseFloat(account.current_balance.toString()) >= 0
                          ? ds.text.primary
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(parseFloat(account.current_balance.toString()))}
                      </p>
                      <button
                        onClick={() => setEditingAccount(account)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${ds.text.primary}`}>Recent</h2>
            <Link href="/transactions/new">
              <Button size="sm">
                <Plus size={18} />
                Add
              </Button>
            </Link>
          </div>

          {transactions.length === 0 ? (
            <Card>
              <div className={`text-center py-8 ${ds.text.secondary}`}>
                <p className="mb-4">No transactions yet</p>
                <Link href="/transactions/new">
                  <Button>Add Your First Transaction</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${ds.text.primary}`}>{transaction.description || transaction.category}</p>
                      <div className={`flex items-center gap-2 text-sm ${ds.text.secondary}`}>
                        <span>{formatDate(new Date(transaction.date), 'MMM d')}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.category}</span>
                      </div>
                    </div>
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount.toString()))}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>



      {/* Modals */}
      {showAddAccountModal && user && (
        <AddAccountModal
          userId={user.id}
          onClose={() => setShowAddAccountModal(false)}
          onUpdate={() => loadDashboardData(user.id)}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onUpdate={() => loadDashboardData(user.id)}
        />
      )}

      {showActionModal && user && (
        <UnifiedActionModal
          userId={user.id}
          onClose={() => setShowActionModal(false)}
          onUpdate={() => loadDashboardData(user.id)}
        />
      )}
    </div>
  )
}
