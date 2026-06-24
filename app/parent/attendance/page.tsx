'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ParentSidebar from '@/components/layout/ParentSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_CHILDREN = [
  { id: 'child-1', name: 'Emma Smith', grade: 7 },
  { id: 'child-2', name: 'James Smith', grade: 4 },
]

const MOCK_ATTENDANCE: Record<string, any> = {
  'child-1': {
    totalDays: 164, present: 159, absent: 3, tardy: 2,
    records: [
      { date: 'Jun 20', day: 'Friday', status: 'Present', note: '' },
      { date: 'Jun 19', day: 'Thursday', status: 'Present', note: '' },
      { date: 'Jun 18', day: 'Wednesday', status: 'Tardy', note: 'Arrived 12 min late' },
      { date: 'Jun 17', day: 'Tuesday', status: 'Present', note: '' },
      { date: 'Jun 16', day: 'Monday', status: 'Present', note: '' },
      { date: 'Jun 13', day: 'Friday', status: 'Absent', note: 'Excused — Doctor appt.' },
      { date: 'Jun 12', day: 'Thursday', status: 'Present', note: '' },
      { date: 'Jun 11', day: 'Wednesday', status: 'Present', note: '' },
      { date: 'Jun 10', day: 'Tuesday', status: 'Absent', note: 'Excused — Family emergency' },
      { date: 'Jun 9', day: 'Monday', status: 'Present', note: '' },
    ],
  },
  'child-2': {
    totalDays: 164, present: 163, absent: 1, tardy: 0,
    records: [
      { date: 'Jun 20', day: 'Friday', status: 'Present', note: '' },
      { date: 'Jun 19', day: 'Thursday', status: 'Present', note: '' },
      { date: 'Jun 18', day: 'Wednesday', status: 'Present', note: '' },
      { date: 'Jun 17', day: 'Tuesday', status: 'Present', note: '' },
      { date: 'Jun 16', day: 'Monday', status: 'Present', note: '' },
      { date: 'Jun 13', day: 'Friday', status: 'Present', note: '' },
      { date: 'Jun 12', day: 'Thursday', status: 'Absent', note: 'Excused — Sick' },
      { date: 'Jun 11', day: 'Wednesday', status: 'Present', note: '' },
      { date: 'Jun 10', day: 'Tuesday', status: 'Present', note: '' },
      { date: 'Jun 9', day: 'Monday', status: 'Present', note: '' },
    ],
  },
}

export default function ParentAttendancePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'parent') { router.push('/login'); return }
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

  const att = MOCK_ATTENDANCE[activeChildId]
  const activeChild = MOCK_CHILDREN.find(c => c.id === activeChildId)!
  const rate = Math.round((att.present / att.totalDays) * 100)

  function statusColor(s: string) {
    if (s === 'Present') return { color: '#1d6a3a', bg: '#d1fae5' }
    if (s === 'Absent') return { color: '#b91c1c', bg: '#fee2e2' }
    return { color: '#b45309', bg: '#fef3c7' }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/attendance"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
              {MOCK_CHILDREN.map(child => (
                <button key={child.id} onClick={() => setActiveChildId(child.id)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: activeChildId === child.id ? '#1A3A5C' : '#888' }}>
                  {child.name}
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: activeChildId === child.id ? '#C47A2C' : '#bbb' }}>Grade {child.grade}</span>
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>{activeChild.name} — Attendance</h1>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Attendance Rate', value: rate + '%', color: rate >= 95 ? '#1d6a3a' : '#b91c1c' },
              { label: 'Days Present', value: String(att.present), color: '#1d6a3a' },
              { label: 'Days Absent', value: String(att.absent), color: '#b91c1c' },
              { label: 'Tardy', value: String(att.tardy), color: '#b45309' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '26px', fontWeight: '700', color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', color: '#5B2C83', fontSize: '13px' }}>Recent Attendance Record</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Date', 'Day', 'Status', 'Note'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '700', color: '#1A3A5C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {att.records.map((r: any, i: number) => {
                  const sc = statusColor(r.status)
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '9px 14px', fontWeight: '500' }}>{r.date}</td>
                      <td style={{ padding: '9px 14px', color: '#777' }}>{r.day}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: sc.bg, color: sc.color }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '9px 14px', color: '#888', fontStyle: r.note ? 'normal' : 'italic' }}>{r.note || '—'}</td>
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