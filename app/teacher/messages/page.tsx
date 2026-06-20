'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const THREADS = [
  { id: 1, name: 'Mia Kim', role: 'Parent', preview: "Re: Jordan's test", time: '10m' },
  { id: 2, name: 'Dr. Osei', role: 'Admin', preview: 'Staff meeting', time: '2h' },
]

export default function TeacherMessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(THREADS[0])
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/messages" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div style={{ width: '200px', minWidth: '200px', borderRight: '1px solid #d0c4a0', background: 'white' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #ede8dc', fontWeight: '700', fontSize: '13px', color: '#2E6B4A' }}>Inbox</div>
          {THREADS.map(t => (
            <div key={t.id} onClick={() => setActive(t)} style={{ padding: '10px 12px', borderBottom: '1px solid #ede8dc', cursor: 'pointer', background: active.id === t.id ? '#e8f5ee' : 'white' }}>
              <div style={{ fontWeight: '600', fontSize: '12px', color: '#2E6B4A' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{t.preview}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-8">
          <div style={{ fontWeight: '700', color: '#5B2C83' }}>{active.name} — {active.role}</div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}