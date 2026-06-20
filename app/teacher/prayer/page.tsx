'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const POSTED = [
  { id: 1, who: 'Mia Kim · Parent', req: 'Please pray for our family as we navigate some health challenges this month.', praying: 14 },
  { id: 2, who: 'Mr. Patel · Teacher', req: 'Please keep the Rivera family in your prayers during a difficult time.', praying: 18 },
]

export default function TeacherPrayerPage() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/prayer" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2E6B4A' }}>Prayer Board</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>Shared among staff and families. Students never see this board.</p>
          <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
            <textarea placeholder="Share your prayer request..." style={{ width: '100%', minHeight: '70px', padding: '8px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', marginBottom: '8px' }} />
            <button style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Submit for Review</button>
          </div>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            {POSTED.map(p => (
              <div key={p.id} style={{ padding: '14px 16px', borderBottom: '1px solid #ede8dc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', color: '#5B2C83' }}>{p.who}</div>
                  <span style={{ fontSize: '11px', color: '#5B2C83' }}>🙏 {p.praying} praying</span>
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>"{p.req}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}