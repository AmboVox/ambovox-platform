'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PENDING = [
  { id: 1, who: 'Robert Ellis · Parent', req: 'Please pray for our family during a difficult season. Devon has been struggling and we are working through some challenges at home.', submitted: 'Jun 1 · 8:42 AM' },
]

const POSTED = [
  { id: 2, who: 'Mia Kim · Parent', req: 'Please pray for our family as we navigate some health challenges this month.', posted: 'May 29', praying: 14 },
  { id: 3, who: 'Ms. Hart · Teacher', req: 'Praying for wisdom and patience as we finish the semester strong. Grateful for this community.', posted: 'May 22', praying: 22 },
  { id: 4, who: 'Mr. Patel · Teacher', req: 'Please keep the Rivera family in your prayers during a difficult time.', posted: 'May 15', praying: 18 },
]

export default function PrayerBoardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(PENDING)
  const [posted, setPosted] = useState(POSTED)
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

  function approve(id: number) {
    const item = pending.find(p => p.id === id)
    if (!item) return
    setPending(pending.filter(p => p.id !== id))
    setPosted([{ id: item.id, who: item.who, req: item.req, posted: 'Today', praying: 0 }, ...posted])
  }

  function decline(id: number) {
    setPending(pending.filter(p => p.id !== id))
  }

  function remove(id: number) {
    setPosted(posted.filter(p => p.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/prayer" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#C47A2C' }}>Prayer Board</h1>
          <p className="text-sm text-gray-500 mb-6">All requests are reviewed before posting. Students never see this board.</p>

          <div className="bg-white rounded-lg border mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900 flex items-center gap-2" style={{ borderColor: '#d0c4a0' }}>
              Pending Review
              {pending.length > 0 && <span style={{ background: '#C47A2C', color: 'white', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '10px' }}>{pending.length}</span>}
            </div>
            {pending.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No requests pending review.</div>
            ) : pending.map(p => (
              <div key={p.id} className="p-4 border-b last:border-b-0" style={{ borderColor: '#ede8dc', borderLeft: '3px solid #C47A2C' }}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ fontWeight: '700', fontSize: '12px', color: '#5B2C83' }}>{p.who}</div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{p.submitted}</div>
                </div>
                <div style={{ fontSize: '13px', color: '#121212', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '10px' }}>"{p.req}"</div>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} style={{ padding: '5px 14px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => decline(p.id)} style={{ padding: '5px 14px', background: '#8C1D2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Posted Requests</div>
            {posted.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No posted requests.</div>
            ) : posted.map(p => (
              <div key={p.id} className="p-4 border-b last:border-b-0" style={{ borderColor: '#ede8dc' }}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ fontWeight: '700', fontSize: '12px', color: '#5B2C83' }}>{p.who}</div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '11px', color: '#5B2C83' }}>🙏 {p.praying} praying</span>
                    <span style={{ fontSize: '10px', color: '#aaa' }}>Posted {p.posted}</span>
                    <button onClick={() => remove(p.id)} style={{ padding: '3px 10px', background: '#8C1D2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#121212', fontStyle: 'italic', lineHeight: '1.7' }}>"{p.req}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}