'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DAYS = [
  { day: 'Monday May 26', type: 'Home', note: 'Lecture videos unlocked. Parents coach and reinforce. Discussion open. Knowledge checks available.' },
  { day: 'Tuesday May 27', type: 'Campus', note: 'Application work in class. Teacher circulates. Quizzes & tests administered. Office hours 3–4 PM.' },
  { day: 'Wednesday May 28', type: 'Home', note: 'Lecture videos unlocked. Parents coach and reinforce. Discussion open. Knowledge checks available.' },
  { day: 'Thursday May 29', type: 'Campus', note: 'Application work in class. Teacher circulates. Quizzes & tests administered. Office hours 3–4 PM.' },
  { day: 'Friday May 30', type: 'Campus', note: 'Application work in class. Teacher circulates. Quizzes & tests administered. Office hours 3–4 PM.' },
]

export default function SchedulePage() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/schedule" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#2E6B4A' }}>Schedule</h1>
          {DAYS.map(d => (
            <div key={d.day} className="bg-white rounded-lg border mb-3" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ padding: '10px 16px', background: d.type === 'Home' ? '#e8f5ee' : '#f0eaf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' }}>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{d.day}</span>
                <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '10px', fontWeight: '600', background: d.type === 'Home' ? '#d4f0e4' : '#ede0f8', color: d.type === 'Home' ? '#0a5c35' : '#4a1a72' }}>
                  {d.type === 'Home' ? '🏠 Home' : '🏫 Campus'}
                </span>
              </div>
              <div style={{ padding: '12px 16px', fontSize: '12px', color: '#555' }}>{d.note}</div>
            </div>
          ))}
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}