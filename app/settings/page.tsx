'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import ThemeToggle from '@/components/ThemeToggle'
import { ds } from '@/lib/design-system'
import { getCurrentUser, signOut } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async() => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    setLoading(false)
  }

  const handleSignOut = async() => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-lg ${ds.text.secondary}`}>Loading settings...</div>
      </div>
    )
  }

  return (
    <div className={ds.bg.page}>
      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <div className="mb-6">
          <Link href="/dashboard" className={`inline-flex items-center text-sm mb-3 ${ds.text.link}`}>
            ← Back to Dashboard
          </Link>
          <h1 className={`text-3xl font-bold ${ds.text.primary}`}>Settings</h1>
          <p className={`mt-2 ${ds.text.secondary}`}>Customize app behavior and manage account-level actions.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`mb-3 text-sm ${ds.text.secondary}`}>Theme preference</p>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={ds.text.primary}>Bill reminders</span>
              <Button variant="secondary" size="sm" disabled>Coming soon</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className={ds.text.primary}>Weekly summary emails</span>
              <Button variant="secondary" size="sm" disabled>Coming soon</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={handleSignOut}>
              Log out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
