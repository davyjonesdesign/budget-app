'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'
import { X } from 'lucide-react'

interface AddAccountModalProps {
  userId: string
  onClose: () => void
  onUpdate: () => void
}

export default function AddAccountModal({ userId, onClose, onUpdate }: AddAccountModalProps) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [type, setType] = useState<'checking' | 'savings'>('checking')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !balance) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          name,
          current_balance: parseFloat(balance),
          type
        })

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error creating account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${ds.text.primary}`}>Add Account</h2>
          <button onClick={onClose} className={ds.button.ghost}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={ds.input.base}
              placeholder="Main Checking, Emergency Fund..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('checking')}
                className={`p-4 rounded-lg border-2 transition ${
                  type === 'checking'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : `${ds.border.default} ${ds.bg.surface}`
                }`}
              >
                <div className={`font-semibold ${ds.text.primary}`}>Checking</div>
                <div className={`text-xs ${ds.text.secondary}`}>Day-to-day spending</div>
              </button>
              <button
                type="button"
                onClick={() => setType('savings')}
                className={`p-4 rounded-lg border-2 transition ${
                  type === 'savings'
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : `${ds.border.default} ${ds.bg.surface}`
                }`}
              >
                <div className={`font-semibold ${ds.text.primary}`}>Savings</div>
                <div className={`text-xs ${ds.text.secondary}`}>Emergency & goals</div>
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Current Balance
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-2.5 ${ds.text.secondary}`}>$</span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                className={`${ds.input.base} pl-8`}
                placeholder="0.00"
                required
              />
            </div>
            <p className={`text-xs ${ds.text.secondary} mt-1`}>
              Enter your current balance for this account
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
