'use client'

import { useState } from 'react'
import { Account } from '@/types'
import { supabase } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'

interface EditAccountModalProps {
  account: Account
  onClose: () => void
  onUpdate: () => void
}

export default function EditAccountModal({ account, onClose, onUpdate }: EditAccountModalProps) {
  const [name, setName] = useState(account.name)
  const [balance, setBalance] = useState(account.current_balance.toString())
  const [type, setType] = useState<'checking' | 'savings'>(account.type)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          name,
          current_balance: parseFloat(balance),
          type,
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error updating account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async() => {
    if (!confirm('Delete this account? All transactions will also be deleted.')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', account.id)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error deleting account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${ds.bg.card} rounded-lg max-w-md w-full p-6`}>
        <h2 className={`text-2xl font-bold ${ds.text.primary} mb-4`}>Edit Account</h2>

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
              required
            />
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
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('checking')}
                className={`p-3 rounded-lg border-2 transition ${
                  type === 'checking'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : `${ds.border.default} ${ds.bg.surface}`
                }`}
              >
                Checking
              </button>
              <button
                type="button"
                onClick={() => setType('savings')}
                className={`p-3 rounded-lg border-2 transition ${
                  type === 'savings'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : `${ds.border.default} ${ds.bg.surface}`
                }`}
              >
                Savings
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
