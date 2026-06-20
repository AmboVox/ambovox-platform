'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MY_COURSES = [
  { id: 1, name: 'Algebra I', students: 28, progress: 74 },
  { id: 2, name: 'Pre-Calculus Honors', students: 24, progress: 61 },
  { id: 3, name: 'Math Foundations', students: 18, progress: 45 },
]

export default function TeacherDashboard() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3, issues: 0 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#2E6B4A' }}>My Courses</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Active Courses', value: MY_COURSES.length.toString(), sub: 'Spring 2026' },
              { label: 'Total Students', value: MY_COURSES.reduce((a,c) => a + c.students, 0).toString(), sub: 'across all courses' },
              { label: 'Avg Completion', value: Math.round(MY_COURSES.reduce((a,c) => a + c.progress, 0) / MY_COURSES.length) + '%', sub: '' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#2E6B4A' }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>My Courses</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Course','Students','Progress',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MY_COURSES.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{c.name}</td>
                    <td style={{ padding: '8px 14px' }}>{c.students}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '6px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.progress}%`, height: '100%', background: '#2E6B4A', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#888' }}>{c.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}