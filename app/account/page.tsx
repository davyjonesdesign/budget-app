'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ds } from '@/lib/design-system'
import { getCurrentUser } from '@/lib/supabase/client'

export default function AccountPage() {
  const [user, setUser] = useState<any | null>(null)
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

    setUser(currentUser)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-lg ${ds.text.secondary}`}>Loading account...</div>
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
          <h1 className={`text-3xl font-bold ${ds.text.primary}`}>Account</h1>
          <p className={`mt-2 ${ds.text.secondary}`}>Manage your profile details and personal preferences.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className={`text-sm font-medium ${ds.text.label}`}>Email</p>
              <p className={ds.text.primary}>{user?.email || 'Not available'}</p>
            </div>
            <div>
              <p className={`text-sm font-medium ${ds.text.label}`}>Display name</p>
              <p className={ds.text.primary}>{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon: Editable Profile Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${ds.text.label}`}>Name</label>
              <input
                type="text"
                disabled
                value={user?.user_metadata?.full_name || ''}
                placeholder="Editing coming soon"
                className={`${ds.input.base} opacity-60`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${ds.text.label}`}>Avatar URL</label>
              <input
                type="url"
                disabled
                value={user?.user_metadata?.avatar_url || ''}
                placeholder="Editing coming soon"
                className={`${ds.input.base} opacity-60`}
              />
            </div>
            <Button variant="secondary" disabled>
              Save changes (coming soon)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
