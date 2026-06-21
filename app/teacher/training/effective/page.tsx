'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PROTOCOLS = [
  { id: 1, title: 'Flipped Classroom Policy', version: 'V1.0', tier: 'Read & Sign' },
  { id: 2, title: 'Assessment Integrity Protocol', version: 'V2.0', tier: 'Quiz Required' },
  { id: 3, title: 'Field Trip Permission Process', version: 'V1.0', tier: 'Reference Only' },
]

export default function TeacherEffectivePage() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/training/effective" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2E6B4A' }}>Effective Protocols</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>The school's living reference library of current SOPs and Work Instructions.</p>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            {PROTOCOLS.map(p => (
              <div key={p.id} style={{ padding: '12px 16px', borderBottom: '1px solid #ede8dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{p.version}</div>
                </div>
                <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}