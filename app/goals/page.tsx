'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { SavingsGoal } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ds } from '@/lib/design-system'
import { Plus, Edit2, Trash2, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/date'

export default function GoalsPage() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    color: 'blue' as 'blue' | 'green' | 'purple' | 'orange' | 'red'
  })

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
    loadGoals(currentUser.id)
  }

  const loadGoals = async(userId: string) => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('savings_goals')
          .update({
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount),
            color: formData.color,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGoal.id)

        if (error) throw error
      } else {
        // Create new goal
        const { error } = await supabase
          .from('savings_goals')
          .insert({
            user_id: user.id,
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount),
            color: formData.color
          })

        if (error) throw error
      }

      // Reset form and reload
      setFormData({ name: '', target_amount: '', current_amount: '', color: 'blue' })
      setEditingGoal(null)
      setShowModal(false)
      loadGoals(user.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error saving goal: ' + message)
    }
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      color: goal.color
    })
    setShowModal(true)
  }

  const handleDelete = async(goalId: string) => {
    if (!confirm('Delete this savings goal?')) return

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      loadGoals(user.id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error deleting goal: ' + message)
    }
  }

  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-600' },
    { value: 'green', label: 'Green', class: 'bg-green-600' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-600' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-600' },
    { value: 'red', label: 'Red', class: 'bg-red-600' }
  ]

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className={ds.button.ghost}>
                ← Back
              </button>
              <h1 className={`text-2xl font-bold ${ds.text.primary}`}>Savings Goals</h1>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} className="mr-2" />
              Add Goal
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {goals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target size={48} className={`mx-auto mb-4 ${ds.text.secondary}`} />
            <h2 className={`text-xl font-semibold ${ds.text.primary} mb-2`}>No Savings Goals Yet</h2>
            <p className={`${ds.text.secondary} mb-6`}>
              Create your first savings goal to start tracking your progress
            </p>
            <Button onClick={() => setShowModal(true)}>Create Your First Goal</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => {
              const progress = (goal.current_amount / goal.target_amount) * 100
              const colorMap = {
                blue: 'bg-blue-600',
                green: 'bg-green-600',
                purple: 'bg-purple-600',
                orange: 'bg-orange-600',
                red: 'bg-red-600'
              }

              return (
                <Card key={goal.id}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${ds.text.primary} mb-1`}>{goal.name}</h3>
                      <p className={`text-sm ${ds.text.secondary}`}>
                        {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className={`w-full ${ds.bg.surface} rounded-full h-6 mb-3`}>
                    <div
                      className={`h-6 rounded-full ${colorMap[goal.color]} transition-all duration-300 flex items-center justify-center text-white text-sm font-semibold`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                      {progress > 10 && `${progress.toFixed(0)}%`}
                    </div>
                  </div>

                  <div className={`flex justify-between text-sm ${ds.text.secondary}`}>
                    <span>{progress.toFixed(1)}% complete</span>
                    <span>{formatCurrency(goal.target_amount - goal.current_amount)} remaining</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
            <h2 className={`text-2xl font-bold ${ds.text.primary} mb-4`}>
              {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Goal Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={ds.input.base}
                  placeholder="Emergency Fund"
                  required
                />
              </div>

              <div>
                <label htmlFor="target" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Target Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
                  <input
                    id="target"
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                    className={`${ds.input.base} pl-8`}
                    placeholder="5000.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="current" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                  Current Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
                  <input
                    id="current"
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={e => setFormData({ ...formData, current_amount: e.target.value })}
                    className={`${ds.input.base} pl-8`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>Color</label>
                <div className="flex gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value as any })}
                      className={`w-10 h-10 rounded-full ${color.class} ${
                        formData.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false)
                    setEditingGoal(null)
                    setFormData({ name: '', target_amount: '', current_amount: '', color: 'blue' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
