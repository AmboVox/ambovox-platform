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

const MOCK_CONFERENCES: Record<string, any[]> = {
  'child-1': [
    { id: 1, teacher: 'Ms. Elena Hart', subject: 'Algebra I', date: 'Jun 28', time: '9:00 AM', duration: '20 min', status: 'Confirmed', location: 'Room 14' },
    { id: 2, teacher: 'Mrs. Sarah Alcott', subject: 'Classical Literature', date: 'Jun 28', time: '10:00 AM', duration: '20 min', status: 'Pending', location: 'Room 8' },
    { id: 3, teacher: 'Mr. Thomas Wells', subject: 'History of Christendom', date: 'Mar 12', time: '2:30 PM', duration: '20 min', status: 'Completed', location: 'Room 3', notes: 'Emma is excelling. Encourage her to continue her independent reading.' },
  ],
  'child-2': [
    { id: 1, teacher: 'Mrs. Cole', subject: 'Grade 4 General', date: 'Jun 29', time: '11:00 AM', duration: '30 min', status: 'Confirmed', location: 'Room 2' },
    { id: 2, teacher: 'Mrs. Cole', subject: 'Grade 4 General', date: 'Mar 10', time: '9:30 AM', duration: '30 min', status: 'Completed', location: 'Room 2', notes: 'James is doing wonderfully. His scripture memorization is exceptional.' },
  ],
}

function statusStyle(s: string) {
  if (s === 'Confirmed') return { color: '#1d6a3a', bg: '#d1fae5' }
  if (s === 'Pending') return { color: '#b45309', bg: '#fef3c7' }
  if (s === 'Completed') return { color: '#888', bg: '#f3f4f6' }
  return { color: '#555', bg: '#f3f4f6' }
}

export default function ParentConferencesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [expandedNote, setExpandedNote] = useState<number | null>(null)
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

  const activeChild = MOCK_CHILDREN.find(c => c.id === activeChildId)!
  const conferences = MOCK_CONFERENCES[activeChildId]
  const upcoming = conferences.filter(c => c.status !== 'Completed')
  const past = conferences.filter(c => c.status === 'Completed')

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/conferences"
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

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>{activeChild.name} — Conferences</h1>

          {upcoming.length > 0 && (
            <div className="mb-6">
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcoming.map(c => {
                  const ss = statusStyle(c.status)
                  return (
                    <div key={c.id} className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '60px' }}>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: '#1A3A5C' }}>{c.date}</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A3A5C' }}>{c.time}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#333' }}>{c.teacher}</div>
                          <div style={{ fontSize: '11px', color: '#C47A2C', marginTop: '1px' }}>{c.subject}</div>
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{c.location} · {c.duration}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '3px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: ss.bg, color: ss.color }}>{c.status}</span>
                        {c.status === 'Pending' && (
                          <button style={{ padding: '6px 14px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past Conferences</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {past.map(c => (
                  <div key={c.id} className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: c.notes ? '10px' : '0' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '60px' }}>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: '#888' }}>{c.date}</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#888' }}>{c.time}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#555' }}>{c.teacher}</div>
                          <div style={{ fontSize: '11px', color: '#C47A2C', marginTop: '1px' }}>{c.subject}</div>
                        </div>
                      </div>
                      <span style={{ padding: '3px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: '#f3f4f6', color: '#888' }}>Completed</span>
                    </div>
                    {c.notes && (
                      <div style={{ background: '#f9f6ee', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', lineHeight: '1.6', color: '#555', borderLeft: '3px solid #C47A2C' }}>
                        <span style={{ fontWeight: '700', color: '#C47A2C' }}>Teacher Notes: </span>{c.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}