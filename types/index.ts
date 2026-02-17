export interface User {
  id: string
  email: string
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: 'checking' | 'savings'
  current_balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  is_recurring: boolean
  recurrence_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  yearly_month?: number
  yearly_day?: number
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  user_id: string
  name: string
  total_amount: number
  current_balance: number
  interest_rate: number
  minimum_payment: number
  due_date: number
  created_at: string
  updated_at: string
}

// New: Savings Goal type
export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  created_at: string
  updated_at: string
}

export type ViewMode = 'month' | 'week' | 'day'