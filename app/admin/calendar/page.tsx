'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const EVENTS: Record<number,{label:string,color:string}[]> = {
  5: [{label:'Module 1 Test',color:'#fceaea'}],
  10: [{label:'Field Trip',color:'#ede0f8'}],
  15: [{label:'Progress Reports',color:'#fdebd0'}],
  20: [{label:'Honor Roll Published',color:'#e8f5ee'}],
  25: [{label:'Staff Meeting',color:'#e8f0fc'}],
  28: [{label:'Last Day',color:'#ede0f8'}],
}
const HOME_DAYS = [2,4,9,11,16,18,23,25]
const CAMPUS_DAYS = [1,3,5,8,10,12,15,17,19,22,24,26]

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.push('/login'); return }
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

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/calendar" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>School Calendar</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Add Event
            </button>
          </div>
          <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div className="flex items-center justify-between mb-4">
              <button style={{ padding: '5px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Previous</button>
              <h2 className="font-bold text-purple-900 text-lg">June 2026</h2>
              <button style={{ padding: '5px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Next</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '8px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#C47A2C', padding: '5px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
              {[...Array(30)].map((_,i) => {
                const day = i + 1
                const dow = i % 7
                const isWeekend = dow === 0 || dow === 6
                const isHome = HOME_DAYS.includes(day)
                const isCampus = CAMPUS_DAYS.includes(day)
                const isToday = day === 15
                const bg = isWeekend ? '#f9f6ee' : isHome ? '#e8f5ee' : isCampus ? '#f0eaf8' : 'white'
                return (
                  <div key={day} style={{ minHeight: '52px', border: '1px solid #e8e0d0', borderRadius: '4px', padding: '4px', background: bg, cursor: 'pointer' }}>
                    <div style={{ fontSize: '11px', fontWeight: isToday ? '700' : '600', color: isToday ? '#C47A2C' : '#121212', marginBottom: '2px' }}>{day}</div>
                    {EVENTS[day]?.map((ev,ei) => (
                      <div key={ei} style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '3px', marginBottom: '1px', background: ev.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.label}</div>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4" style={{ fontSize: '11px', color: '#888' }}>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#e8f5ee', marginRight: '4px' }}></span>Home day</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#f0eaf8', marginRight: '4px' }}></span>Campus day</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#f9f6ee', marginRight: '4px' }}></span>Weekend</span>
            </div>
          </div>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Upcoming Events</div>
            {Object.entries(EVENTS).map(([day, events]) => events.map((ev,i) => (
              <div key={`${day}-${i}`} className="p-3 border-b last:border-b-0 flex items-center justify-between" style={{ borderColor: '#ede8dc' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '12px', color: '#5B2C83' }}>{ev.label}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>June {day}, 2026</div>
                </div>
                <div style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: ev.color, fontWeight: '600' }}>Event</div>
              </div>
            )))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}