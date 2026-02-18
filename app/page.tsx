'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, supabase } from '@/lib/supabase/client'
import { ds } from '@/lib/design-system'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking auth...')
      const user = await getCurrentUser()
      console.log('User:', user)
      
      if (user) {
        // Check if user has completed onboarding
        console.log('Checking for accounts...')
        const { data: accounts, error } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        console.log('Accounts:', accounts, 'Error:', error)
        
        if (accounts && accounts.length > 0) {
          console.log('Has accounts - redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('No accounts - redirecting to onboarding')
          router.push('/onboarding')
        }
      } else {
        console.log('No user, showing landing page')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in checkAuth:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-lg ${ds.text.secondary}`}>Loading...</div>
      </div>
    )
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${ds.bg.gradient}`}>
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand-mark.svg" alt="Budgety" width={40} height={40} className="h-10 w-10" />
            <h1 className={`text-4xl font-bold ${ds.text.primary}`}>
              Budgety
            </h1>
          </div>
          <p className={ds.text.secondary}>
            Simple family budget tracking for bills, income, and spending
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signup"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          
          <Link
            href="/auth/login"
            className={`block w-full ${ds.bg.card} text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition border ${ds.border.light}`}
          >
            Sign In
          </Link>
          
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-2xl mb-1">📅</div>
              <p className={`text-sm ${ds.text.secondary}`}>Month View</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💰</div>
              <p className={`text-sm ${ds.text.secondary}`}>Track Bills</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📊</div>
              <p className={`text-sm ${ds.text.secondary}`}>See Balance</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}