'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const GRADES = [
  { id: 1, name: 'Aaliyah Brooks', hw: 95, quiz: 88, test: 91, overall: 91 },
  { id: 2, name: 'Ben Castillo', hw: 72, quiz: 65, test: null, overall: 69 },
  { id: 3, name: 'Chloe Dumont', hw: 100, quiz: 97, test: 98, overall: 98 },
  { id: 4, name: 'Devon Ellis', hw: null, quiz: null, test: null, overall: 41 },
]

function letter(p: number) {
  if (p >= 90) return 'A'
  if (p >= 80) return 'B'
  if (p >= 70) return 'C'
  if (p >= 60) return 'D'
  return 'F'
}

export default function GradebookPage() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/gradebook" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#2E6B4A' }}>Gradebook — Algebra I</h1>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Class Avg', value: '82%' },
              { label: 'Due This Week', value: '3' },
              { label: 'Missing Work', value: '7' },
              { label: 'Ungraded', value: '24' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#2E6B4A' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Student','HW #4','Quiz 2','Unit Test','Overall','Letter','Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADES.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{g.name}</td>
                    <td style={{ padding: '8px 14px' }}>{g.hw ?? '—'}</td>
                    <td style={{ padding: '8px 14px' }}>{g.quiz ?? '—'}</td>
                    <td style={{ padding: '8px 14px' }}>{g.test ?? '—'}</td>
                    <td style={{ padding: '8px 14px', fontWeight: '700' }}>{g.overall}%</td>
                    <td style={{ padding: '8px 14px', fontWeight: '700' }}>{letter(g.overall)}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: g.overall >= 90 ? '#d4edda' : g.overall >= 70 ? '#fff3cd' : '#f8d7da', color: g.overall >= 90 ? '#155724' : g.overall >= 70 ? '#856404' : '#721c24' }}>
                        {g.overall >= 90 ? 'A standing' : g.overall >= 70 ? 'Watch' : 'At risk'}
                      </span>
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