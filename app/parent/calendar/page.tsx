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

const MOCK_EVENTS = [
  { date: '2026-06-24', title: 'Field Day', type: 'event', grade: 'All' },
  { date: '2026-06-25', title: 'Assignment Due — Latin Worksheet', type: 'academic', grade: '7' },
  { date: '2026-06-25', title: 'Assignment Due — Arithmetic Sheet', type: 'academic', grade: '4' },
  { date: '2026-06-27', title: 'End-of-Year Ceremony', type: 'event', grade: 'All' },
  { date: '2026-06-27', title: 'Last Day of School', type: 'holiday', grade: 'All' },
  { date: '2026-06-28', title: 'Parent-Teacher Conference', type: 'conference', grade: '7' },
  { date: '2026-07-01', title: 'Tuition Due', type: 'finance', grade: 'All' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function typeStyle(t: string) {
  if (t === 'event') return { color: '#1d6a3a', bg: '#d1fae5' }
  if (t === 'academic') return { color: '#1A3A5C', bg: '#dbeafe' }
  if (t === 'holiday') return { color: '#b91c1c', bg: '#fee2e2' }
  if (t === 'conference') return { color: '#5B2C83', bg: '#ede8f5' }
  if (t === 'finance') return { color: '#b45309', bg: '#fef3c7' }
  return { color: '#555', bg: '#f3f4f6' }
}

export default function ParentCalendarPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(5)
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
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()

  function eventsForDay(day: number) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return MOCK_EVENTS.filter(e => e.date === key && (e.grade === 'All' || e.grade === String(activeChild.grade)))
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const upcomingEvents = MOCK_EVENTS
    .filter(e => e.date >= `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01` && (e.grade === 'All' || e.grade === String(activeChild.grade)))
    .slice(0, 5)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/calendar"
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

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>Calendar</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px' }}>

            <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button onClick={prevMonth} style={{ padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '16px', color: '#1A3A5C' }}>‹</button>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#1A3A5C' }}>{MONTHS[viewMonth]} {viewYear}</div>
                <button onClick={nextMonth} style={{ padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '16px', color: '#1A3A5C' }}>›</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#888', padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = eventsForDay(day)
                  const isWeekend = new Date(viewYear, viewMonth, day).getDay() === 0 || new Date(viewYear, viewMonth, day).getDay() === 6
                  return (
                    <div key={day} style={{ minHeight: '64px', padding: '4px', borderRadius: '4px', background: isWeekend ? '#f5f3ee' : 'white', border: '1px solid #ede8dc' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: isWeekend ? '#ccc' : '#333', marginBottom: '2px' }}>{day}</div>
                      {dayEvents.map((ev, ei) => {
                        const ts = typeStyle(ev.type)
                        return (
                          <div key={ei} style={{ fontSize: '9px', fontWeight: '600', padding: '1px 4px', borderRadius: '3px', marginBottom: '1px', background: ts.bg, color: ts.color, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83', marginBottom: '12px' }}>Upcoming Events</div>
                {upcomingEvents.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#aaa' }}>No upcoming events</div>
                ) : upcomingEvents.map((ev, i) => {
                  const ts = typeStyle(ev.type)
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ background: ts.bg, color: ts.color, borderRadius: '4px', padding: '4px 6px', fontSize: '10px', fontWeight: '700', flexShrink: 0, minWidth: '52px', textAlign: 'center' }}>
                        {ev.date.slice(5).replace('-', '/')}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>{ev.title}</div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83', marginBottom: '10px' }}>Legend</div>
                {[['event','School Event'],['academic','Academic'],['holiday','No School'],['conference','Conference'],['finance','Finance']].map(([t, l]) => {
                  const ts = typeStyle(t)
                  return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: ts.bg, border: `1px solid ${ts.color}` }} />
                      <span style={{ fontSize: '11px', color: '#555' }}>{l}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}