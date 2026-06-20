'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const ROSTER = [
  { id: 1, name: 'Aaliyah Brooks', status: 'Present', lecture: 'Yes' },
  { id: 2, name: 'Ben Castillo', status: 'Absent', lecture: 'No' },
  { id: 3, name: 'Chloe Dumont', status: 'Present', lecture: 'Yes' },
  { id: 4, name: 'Devon Ellis', status: 'Late', lecture: 'No' },
]

export default function AttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [roster, setRoster] = useState(ROSTER)
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

  function setStatus(id: number, status: string) {
    setRoster(roster.map(r => r.id === id ? { ...r, status } : r))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'
  const statusColor = (s: string) => s === 'Present' ? { bg: '#d4edda', color: '#155724' } : s === 'Late' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#f8d7da', color: '#721c24' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/attendance" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#2E6B4A' }}>Attendance — Today</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Present', value: roster.filter(r => r.status === 'Present').length.toString() + '/' + roster.length },
              { label: 'Absent', value: roster.filter(r => r.status === 'Absent').length.toString() },
              { label: 'Month Avg', value: '94%' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#2E6B4A' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Today's Roster</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Student','Status','Lecture Watched',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.map(r => {
                  const sc = statusColor(r.status)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{r.name}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: r.lecture === 'Yes' ? '#d4edda' : '#fff3cd', color: r.lecture === 'Yes' ? '#155724' : '#856404' }}>{r.lecture}</span>
                      </td>
                      <td style={{ padding: '8px 14px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setStatus(r.id, 'Present')} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Present</button>
                        <button onClick={() => setStatus(r.id, 'Absent')} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Absent</button>
                        <button onClick={() => setStatus(r.id, 'Late')} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Late</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}