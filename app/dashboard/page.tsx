'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        router.push('/login')
        return
      }

      switch (profile.role) {
       case 'admin': window.location.href = '/admin'; break
        case 'teacher': window.location.href = '/teacher'; break
        case 'parent': window.location.href = '/parent'; break
        case 'student': window.location.href = '/student'; break
        case 'operator': window.location.href = '/operator'; break
        default: router.push('/login')
      }
    }

    redirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )
}