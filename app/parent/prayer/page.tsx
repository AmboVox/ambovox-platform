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

const MOCK_PRAYERS = [
  { id: 1, author: 'Smith Family', date: 'Jun 23', request: 'Please pray for our grandmother who is recovering from surgery. We are grateful for the school community\'s support.', praying: 14 },
  { id: 2, author: 'Anonymous', date: 'Jun 22', request: 'Prayers for wisdom and peace as our family navigates a difficult season. Thank you.', praying: 22 },
  { id: 3, author: 'Martinez Family', date: 'Jun 21', request: 'Our son has a big exam coming up. Please pray for focus, clarity, and that he trusts God with the results.', praying: 18 },
  { id: 4, author: 'Administration', date: 'Jun 20', request: 'Please join us in praying for all of our graduating seniors as they step into the next chapter of their lives. May God guard their steps.', praying: 41 },
  { id: 5, author: 'Johnson Family', date: 'Jun 19', request: 'Praise report — our daughter got into her first-choice university! To God be the glory. Thank you all for your prayers this past year.', praying: 37 },
]

export default function ParentPrayerPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [newRequest, setNewRequest] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [praying, setPraying] = useState<Record<number, boolean>>({})
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

  function togglePraying(id: number) {
    setPraying(prev => ({ ...prev, [id]: !prev[id] }))
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
          activePage="/parent/prayer"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A3A5C' }}>✝️ Prayer Board</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '24px' }}>Share prayer requests with the Rex Christus Academy community. All families and staff can see and pray together.</p>

          <div className="bg-white rounded-lg border p-5 mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83', marginBottom: '10px' }}>Submit a Prayer Request</div>
            <textarea
              value={newRequest}
              onChange={e => setNewRequest(e.target.value)}
              placeholder="Share your prayer request with the community..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #c8bea0', borderRadius: '6px', fontSize: '12px', resize: 'vertical', lineHeight: '1.6', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#555' }}>
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
                Post anonymously
              </label>
              <button
                onClick={() => setNewRequest('')}
                disabled={!newRequest.trim()}
                style={{ padding: '8px 20px', background: newRequest.trim() ? '#1A3A5C' : '#c8bea0', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: newRequest.trim() ? 'pointer' : 'not-allowed' }}
              >
                Submit Request
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_PRAYERS.map(p => (
              <div key={p.id} className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83' }}>{p.author}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{p.date}</div>
                  </div>
                  <button
                    onClick={() => togglePraying(p.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: praying[p.id] ? '2px solid #5B2C83' : '1px solid #c8bea0',
                      background: praying[p.id] ? '#ede8f5' : 'white',
                      color: praying[p.id] ? '#5B2C83' : '#888',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    🙏 {praying[p.id] ? 'Praying' : 'I\'m Praying'} · {p.praying + (praying[p.id] ? 1 : 0)}
                  </button>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.7', color: '#444' }}>{p.request}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}