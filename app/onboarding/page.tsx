'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'
import { Check, ArrowRight, DollarSign, Calendar, Target, Sparkles, Plus, Trash2 } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [user, setUser] = useState<unknown | null>(null)
  const router = useRouter()

  // Form data
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [checkingBalance, setCheckingBalance] = useState('')
  const [payday, setPayday] = useState(new Date().toISOString().split('T')[0])
  const [paydayFrequency, setPaydayFrequency] = useState<'monthly' | 'biweekly'>('biweekly')

  // Quick setup for bills
  const [hasRent, setHasRent] = useState(false)
  const [rentName, setRentName] = useState('Rent')
  const [rentAmount, setRentAmount] = useState('')
  const [rentDay, setRentDay] = useState('1')

  const [additionalBills, setAdditionalBills] = useState<Array<{name: string, amount: string, day: string}>>([])

  const [hasGiving, setHasGiving] = useState(false)
  const [givingAmount, setGivingAmount] = useState('')

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
  }

  const handleComplete = async() => {
    if (!user) return

    try {
      // 1. Create checking account
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: 'Checking',
          type: 'checking',
          current_balance: parseFloat(checkingBalance) || 0
        })
        .select()
        .single()

      if (accountError) throw accountError

      // 2. Create income transaction with actual date
      const incomeDate = new Date(payday)

      await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: accountData.id,
        type: 'income',
        category: 'Paycheck',
        amount: parseFloat(monthlyIncome),
        description: 'Regular income',
        date: incomeDate.toISOString().split('T')[0],
        is_recurring: true,
        recurrence_frequency: paydayFrequency
      })

      // 3. Create bills
      const bills = []

      if (hasRent && rentAmount) {
        const today = new Date()
        bills.push({
          user_id: user.id,
          account_id: accountData.id,
          type: 'expense',
          category: rentName || 'Rent',
          amount: parseFloat(rentAmount),
          date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${rentDay.padStart(2, '0')}`,
          is_recurring: true,
          recurrence_frequency: 'monthly'
        })
      }

      additionalBills.forEach(bill => {
        if (bill.name && bill.amount) {
          const today = new Date()
          bills.push({
            user_id: user.id,
            account_id: accountData.id,
            type: 'expense',
            category: bill.name,
            amount: parseFloat(bill.amount),
            date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${bill.day.padStart(2, '0')}`,
            is_recurring: true,
            recurrence_frequency: 'monthly'
          })
        }
      })

      if (bills.length > 0) {
        await supabase.from('transactions').insert(bills)
      }

      // 4. Create giving goal if specified
      if (hasGiving && givingAmount) {
        await supabase.from('savings_goals').insert({
          user_id: user.id,
          name: 'Giving',
          target_amount: parseFloat(givingAmount) * 12,
          current_amount: 0,
          color: 'green'
        })
      }

      router.push('/dashboard?welcome=true')
    } catch (error: any) {
      alert('Error setting up account: ' + error.message)
    }
  }

  const steps = [
    {
      title: "Let's start simple",
      subtitle: "We'll get you set up in 2 minutes",
      icon: Sparkles
    },
    {
      title: "Your monthly income",
      subtitle: "How much do you typically make per month?",
      icon: DollarSign
    },
    {
      title: "Your checking account",
      subtitle: "What's your current balance?",
      icon: Check
    },
    {
      title: "When do you get paid?",
      subtitle: "We'll track your paydays automatically",
      icon: Calendar
    },
    {
      title: "Quick bill setup",
      subtitle: "Add your biggest bills (you can add more later)",
      icon: Target
    }
  ]

  const currentStep = steps[step]

  return (
    <div className={`min-h-screen ${ds.bg.gradient} flex items-center justify-center p-4`}>
      <div className={`max-w-2xl w-full ${ds.bg.card} rounded-xl shadow-2xl p-8`}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                  idx <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className={`text-sm ${ds.text.secondary} text-center`}>
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Step icon and title */}
        <div className="text-center mb-8">
          <currentStep.icon size={48} className={`mx-auto mb-4 ${ds.text.primary}`} />
          <h1 className={`text-3xl font-bold ${ds.text.primary} mb-2`}>
            {currentStep.title}
          </h1>
          <p className={ds.text.secondary}>{currentStep.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {step === 0 && (
            <div className="space-y-6">
              <div className={`${ds.bg.surface} p-6 rounded-lg`}>
                <h3 className={`font-semibold ${ds.text.primary} mb-3`}>
                  What makes this different?
                </h3>
                <ul className="space-y-2">
                  <li className={`flex items-start gap-2 ${ds.text.secondary}`}>
                    <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>See your money day-by-day, not just monthly totals</span>
                  </li>
                  <li className={`flex items-start gap-2 ${ds.text.secondary}`}>
                    <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Know exactly when bills are due and if you can afford them</span>
                  </li>
                  <li className={`flex items-start gap-2 ${ds.text.secondary}`}>
                    <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No complicated categories - just track what matters</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                Monthly Income (after taxes)
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-4 text-2xl ${ds.text.secondary}`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  className={`${ds.input.base} pl-12 text-2xl py-3`}
                  placeholder="3000"
                  autoFocus
                />
              </div>
              <p className={`text-sm ${ds.text.secondary} mt-2`}>
                This is your "total intake" - we'll show this at the top of your budget
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                Current Checking Balance
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-4 text-2xl ${ds.text.secondary}`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={checkingBalance}
                  onChange={e => setCheckingBalance(e.target.value)}
                  className={`${ds.input.base} pl-12 text-2xl py-3`}
                  placeholder="500"
                  autoFocus
                />
              </div>
              <p className={`text-sm ${ds.text.secondary} mt-2`}>
                We'll track running totals from this starting point
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-3`}>
                  How often do you get paid?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaydayFrequency('biweekly')}
                    className={`p-4 rounded-lg border-2 transition ${
                      paydayFrequency === 'biweekly'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : `${ds.border.default} ${ds.bg.surface}`
                    }`}
                  >
                    <div className={`font-semibold ${ds.text.primary}`}>Every 2 weeks</div>
                    <div className={`text-sm ${ds.text.secondary}`}>Biweekly</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaydayFrequency('monthly')}
                    className={`p-4 rounded-lg border-2 transition ${
                      paydayFrequency === 'monthly'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : `${ds.border.default} ${ds.bg.surface}`
                    }`}
                  >
                    <div className={`font-semibold ${ds.text.primary}`}>Once a month</div>
                    <div className={`text-sm ${ds.text.secondary}`}>Monthly</div>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="nextPayday" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  When is your next payday?
                </label>
                <input
                  id="nextPayday"
                  type="date"
                  value={payday}
                  onChange={e => setPayday(e.target.value)}
                  className={ds.input.base}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className={`text-sm ${ds.text.secondary} mt-2`}>
                  {paydayFrequency === 'biweekly'
                    ? "We'll create paychecks every 2 weeks from this date"
                    : "We'll create a paycheck on this day each month"
                  }
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Rent */}
              <div className={`${ds.bg.surface} p-4 rounded-lg`}>
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={hasRent}
                    onChange={e => setHasRent(e.target.checked)}
                    className={ds.input.checkbox}
                  />
                  <span className={`font-semibold ${ds.text.primary}`}>I pay rent/mortgage</span>
                </label>

                {hasRent && (
                  <div className="space-y-3 ml-8">
                    <div>
                      <label className={`block text-xs ${ds.text.label} mb-1`}>Bill name</label>
                      <input
                        type="text"
                        value={rentName}
                        onChange={e => setRentName(e.target.value)}
                        className={ds.input.base}
                        placeholder="Rent, Mortgage..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs ${ds.text.label} mb-1`}>Amount</label>
                        <div className="relative">
                          <span className={`absolute left-3 top-2.5 ${ds.text.secondary}`}>$</span>
                          <input
                            type="number"
                            value={rentAmount}
                            onChange={e => setRentAmount(e.target.value)}
                            className={`${ds.input.base} pl-8`}
                            placeholder="1200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs ${ds.text.label} mb-1`}>Due date</label>
                        <select
                          value={rentDay}
                          onChange={e => setRentDay(e.target.value)}
                          className={ds.input.select}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Day {day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic bills array */}
              {additionalBills.map((bill, idx) => (
                <div key={idx} className={`${ds.bg.surface} p-4 rounded-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-semibold ${ds.text.primary}`}>Bill #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newBills = additionalBills.filter((_, i) => i !== idx)
                        setAdditionalBills(newBills)
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-xs ${ds.text.label} mb-1`}>Bill name</label>
                      <input
                        type="text"
                        value={bill.name}
                        onChange={e => {
                          const newBills = [...additionalBills]
                          newBills[idx].name = e.target.value
                          setAdditionalBills(newBills)
                        }}
                        className={ds.input.base}
                        placeholder="Electric, Internet..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs ${ds.text.label} mb-1`}>Amount</label>
                        <div className="relative">
                          <span className={`absolute left-3 top-2.5 ${ds.text.secondary}`}>$</span>
                          <input
                            type="number"
                            value={bill.amount}
                            onChange={e => {
                              const newBills = [...additionalBills]
                              newBills[idx].amount = e.target.value
                              setAdditionalBills(newBills)
                            }}
                            className={`${ds.input.base} pl-8`}
                            placeholder="100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs ${ds.text.label} mb-1`}>Due date</label>
                        <select
                          value={bill.day}
                          onChange={e => {
                            const newBills = [...additionalBills]
                            newBills[idx].day = e.target.value
                            setAdditionalBills(newBills)
                          }}
                          className={ds.input.select}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Day {day}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setAdditionalBills([...additionalBills, { name: '', amount: '', day: '1' }])}
                className={`w-full py-3 ${ds.button.secondary} flex items-center justify-center gap-2`}
              >
                <Plus size={18} />
                Add Another Bill
              </button>

              {/* Giving */}
              <div className={`${ds.bg.surface} p-4 rounded-lg`}>
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={hasGiving}
                    onChange={e => setHasGiving(e.target.checked)}
                    className={ds.input.checkbox}
                  />
                  <span className={`font-semibold ${ds.text.primary}`}>I set aside money for giving</span>
                </label>

                {hasGiving && (
                  <div className="ml-8">
                    <label className={`block text-xs ${ds.text.label} mb-1`}>Monthly giving goal</label>
                    <div className="relative">
                      <span className={`absolute left-3 top-2.5 ${ds.text.secondary}`}>$</span>
                      <input
                        type="number"
                        value={givingAmount}
                        onChange={e => setGivingAmount(e.target.value)}
                        className={`${ds.input.base} pl-8`}
                        placeholder="313.33"
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className={`text-sm ${ds.text.secondary} text-center`}>
                Don't worry, you can add more bills and expenses later!
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !monthlyIncome) ||
                (step === 2 && !checkingBalance) ||
                (step === 3 && !payday)
              }
              className="flex-1"
            >
              Continue
              <ArrowRight size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="flex-1"
            >
              Let's Go!
              <Sparkles size={18} />
            </Button>
          )}
        </div>

        {step === 0 && (
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full mt-4 text-sm ${ds.text.secondary} hover:${ds.text.primary} transition`}
          >
            Skip setup, I'll do it later
          </button>
        )}
      </div>
    </div>
  )
}
