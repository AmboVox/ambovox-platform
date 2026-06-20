'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const ANNOUNCEMENTS = [
  { id: 1, title: 'Last Day of School — June 28', priority: 'Urgent', date: 'Jun 1' },
  { id: 2, title: 'End-of-Year Testing Schedule', priority: 'Important', date: 'May 28' },
  { id: 3, title: 'Staff Meeting — Jun 25', priority: 'Normal', date: 'May 25' },
]

export default function TeacherAnnouncementsPage() {
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
  const pc = (p: string) => p === 'Urgent' ? { bg: '#f8d7da', color: '#721c24' } : p === 'Important' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8e0d0', color: '#555' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/announcements" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#2E6B4A' }}>Announcements</h1>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            {ANNOUNCEMENTS.map(a => {
              const c = pc(a.priority)
              return (
                <div key={a.id} style={{ padding: '14px 16px', borderBottom: '1px solid #ede8dc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83' }}>{a.title}</div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: c.bg, color: c.color }}>{a.priority}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{a.date}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}