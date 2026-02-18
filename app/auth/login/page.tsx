'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${ds.bg.gradient} px-4`}>
      <div className={`max-w-md w-full ${ds.bg.card} ${ds.radius.md} ${ds.shadow.lg} p-8`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${ds.text.primary} mb-2`}>Welcome Back</h1>
          <p className={ds.text.secondary}>Sign in to your budgety account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className={`${ds.alert.error} text-sm`}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={ds.input.base}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={ds.input.base}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-sm ${ds.text.secondary}`}>
            Don't have an account?{' '}
            <Link href="/auth/signup" className={`${ds.text.link} font-medium`}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
