'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

export default function TeacherCalendarPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewAll, setViewAll] = useState(false)
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/calendar" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Calendar</h1>
            <div style={{ display: 'flex', gap: '0', border: '1px solid #c8bea0', borderRadius: '6px', overflow: 'hidden' }}>
              <button onClick={() => setViewAll(false)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: !viewAll ? '#2E6B4A' : 'white', color: !viewAll ? 'white' : '#555' }}>My Class</button>
              <button onClick={() => setViewAll(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: viewAll ? '#2E6B4A' : 'white', color: viewAll ? 'white' : '#555' }}>View All</button>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
            <p style={{ fontSize: '13px', color: '#555' }}>
              {viewAll ? 'Showing the full school calendar — all classes, grades, and levels.' : 'Showing events for your classes, grade level, and school-wide events only.'}
            </p>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}