'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const COMPLETED = [
  { id: 1, title: 'New Curriculum Builder Walkthrough', completed: 'May 25, 2026 · 9:14 AM' },
]

export default function TeacherCompletedPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || (profile.role !== 'teacher' && profile.role !== 'teaching_assistant')) { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/training/completed" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2E6B4A' }}>Completed Training</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>Your personal record of completed training items.</p>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            {COMPLETED.map(c => (
              <div key={c.id} style={{ padding: '12px 16px', borderBottom: '1px solid #ede8dc' }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{c.title}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{c.completed}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}