import { Transaction } from '@/types'

export function generateRecurringTransactions(
  transaction: Transaction,
  startDate: Date,
  endDate: Date
): Transaction[] {
  if (!transaction.is_recurring) return [transaction]

  const generated: Transaction[] = []
  const baseDate = new Date(transaction.date)

  const currentDate = new Date(baseDate)
  let id = 1

  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      generated.push({
        ...transaction,
        id: `${transaction.id}-${id}`,
        date: currentDate.toISOString().split('T')[0]
      })
    }

    switch (transaction.recurrence_frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        return generated
    }
    id++
  }

  return generated
}

export function getMonthTransactions(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  const allTransactions: Transaction[] = []

  transactions.forEach(t => {
    if (t.is_recurring) {
      allTransactions.push(...generateRecurringTransactions(t, startDate, endDate))
    } else {
      const tDate = new Date(t.date)
      if (tDate >= startDate && tDate <= endDate) {
        allTransactions.push(t)
      }
    }
  })

  return allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function calculateRunningBalance(
  transactions: Transaction[],
  initialBalance: number,
  upToDate: string
): number {
  let balance = initialBalance
  const targetDate = new Date(upToDate)

  transactions
    .filter(t => new Date(t.date) <= targetDate)
    .forEach(t => {
      balance += t.type === 'income' ? parseFloat(t.amount.toString()) : -parseFloat(t.amount.toString())
    })

  return balance
}

export function getUpcomingBills(
  transactions: Transaction[],
  days: number = 7
): Transaction[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + days)

  const startDate = today
  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 2) // Look ahead 2 months for recurring

  const allUpcoming: Transaction[] = []

  transactions.forEach(t => {
    if (t.type !== 'expense') return

    if (t.is_recurring) {
      const generated = generateRecurringTransactions(t, startDate, endDate)
      allUpcoming.push(...generated.filter(g => {
        const gDate = new Date(g.date)
        return gDate >= today && gDate <= futureDate
      }))
    } else {
      const tDate = new Date(t.date)
      if (tDate >= today && tDate <= futureDate) {
        allUpcoming.push(t)
      }
    }
  })

  return allUpcoming
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
}

// Add this function to the existing file

export function getDayListData(
  transactions: Transaction[],
  year: number,
  month: number,
  initialBalance: number
) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthTransactions = getMonthTransactions(transactions, year, month)

  const dayList = []
  let runningBalance = initialBalance

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayTransactions = monthTransactions.filter(t => t.date === dateStr)

    // Calculate balance for this day
    dayTransactions.forEach(t => {
      runningBalance += t.type === 'income'
        ? parseFloat(t.amount.toString())
        : -parseFloat(t.amount.toString())
    })

    dayList.push({
      day,
      date: dateStr,
      transactions: dayTransactions,
      endingBalance: runningBalance,
      isToday: new Date().toDateString() === new Date(dateStr).toDateString(),
      isPayday: dayTransactions.some(t =>
        t.type === 'income' && t.is_recurring && t.recurrence_frequency === 'biweekly'
      )
    })
  }

  return dayList
}
