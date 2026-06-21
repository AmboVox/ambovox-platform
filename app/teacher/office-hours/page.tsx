'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const SLOTS = [
  { id: 1, time: 'Tue 3:00–3:30 PM', booked: 2 },
  { id: 2, time: 'Tue 3:30–4:00 PM', booked: 1 },
  { id: 3, time: 'Thu 3:00–3:30 PM', booked: 0 },
]

const BOOKINGS = [
  { id: 1, student: 'Jordan Kim', time: 'Tue 3:00 PM', parent: 'Yes — Mia Kim', topic: 'Irrational numbers' },
  { id: 2, student: 'Ben Castillo', time: 'Tue 3:00 PM', parent: 'No', topic: 'Quiz makeup' },
]

export default function OfficeHoursPage() {
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/office-hours" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Office Hours</h1>
            <button style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Add Slot</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>My Schedule</div>
              <div style={{ padding: '12px' }}>
                {SLOTS.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #ede8dc', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12px' }}>{s.time}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{s.booked > 0 ? `${s.booked} booked` : 'Open'}</div>
                    </div>
                    <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Manage</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Upcoming Bookings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Student','Time','Parent','Topic'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOOKINGS.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{b.student}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px' }}>{b.time}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px' }}>{b.parent}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{b.topic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}