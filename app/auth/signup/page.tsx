'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ds } from '@/lib/design-system'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        }
      })

      if (error) throw error

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered. Please sign in.')
        } else {
          setSuccess(true)
          // If email confirmation is disabled, go straight to onboarding
          if (data.session) {
            router.push('/onboarding')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${ds.bg.gradient} px-4`}>
      <div className={`max-w-md w-full ${ds.bg.card} ${ds.radius.md} ${ds.shadow.lg} p-8`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${ds.text.primary} mb-2`}>Get Started</h1>
          <p className={ds.text.secondary}>Create your free budget account</p>
        </div>

        {success ? (
          <div className={`${ds.alert.success} text-center`}>
            <p className="font-medium">Account created!</p>
            <p className="text-sm mt-1">Check your email to confirm your account, then you'll be redirected to set up your budget.</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
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
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${ds.text.label} mb-2`}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={ds.input.base}
                placeholder="Re-enter password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className={`text-sm ${ds.text.secondary}`}>
            Already have an account?{' '}
            <Link href="/auth/login" className={`${ds.text.link} font-medium`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}