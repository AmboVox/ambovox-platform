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

const MOCK_FORMS: Record<string, any[]> = {
  'child-1': [
    { id: 1, title: 'Permission Slip — End of Year Field Trip', due: 'Jun 25', type: 'form', status: 'Pending' },
    { id: 2, title: 'Tuition Payment — July 2026', due: 'Jul 1', type: 'payment', status: 'Pending', amount: '$850.00' },
    { id: 3, title: 'Re-Enrollment Form — 2026-2027', due: 'Jul 15', type: 'form', status: 'Pending' },
    { id: 4, title: 'Tuition Payment — June 2026', due: 'Jun 1', type: 'payment', status: 'Paid', amount: '$850.00' },
    { id: 5, title: 'Emergency Contact Update', due: 'May 15', type: 'form', status: 'Submitted' },
    { id: 6, title: 'Athletic Participation Waiver', due: 'Apr 1', type: 'form', status: 'Submitted' },
  ],
  'child-2': [
    { id: 1, title: 'Permission Slip — Field Day', due: 'Jun 24', type: 'form', status: 'Pending' },
    { id: 2, title: 'Tuition Payment — July 2026', due: 'Jul 1', type: 'payment', status: 'Pending', amount: '$850.00' },
    { id: 3, title: 'Tuition Payment — June 2026', due: 'Jun 1', type: 'payment', status: 'Paid', amount: '$850.00' },
    { id: 4, title: 'Re-Enrollment Form — 2026-2027', due: 'Jul 15', type: 'form', status: 'Pending' },
  ],
}

const TABS = ['All', 'Pending', 'Submitted', 'Paid']

export default function ParentFormsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [tab, setTab] = useState('All')
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
  const allForms = MOCK_FORMS[activeChildId]
  const filtered = tab === 'All' ? allForms : allForms.filter(f => f.status === tab)
  const pendingCount = allForms.filter(f => f.status === 'Pending').length

  function statusStyle(s: string) {
    if (s === 'Paid' || s === 'Submitted') return { color: '#1d6a3a', bg: '#d1fae5' }
    if (s === 'Pending') return { color: '#b91c1c', bg: '#fee2e2' }
    return { color: '#555', bg: '#f3f4f6' }
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
          activePage="/parent/forms"
          badges={{ announcements: 1, messages: 3, forms: pendingCount }}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>Forms & Payments</h1>
            {pendingCount > 0 && (
              <div style={{ background: '#fee2e2', border: '1px solid #b91c1c', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#b91c1c' }}>
                ⚠️ {pendingCount} item{pendingCount > 1 ? 's' : ''} need your attention
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: tab === t ? '2px solid #1A3A5C' : '1px solid #c8bea0', background: tab === t ? '#1A3A5C' : 'white', color: tab === t ? 'white' : '#555' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(item => {
              const ss = statusStyle(item.status)
              return (
                <div key={item.id} className="bg-white rounded-lg border" style={{ borderColor: item.status === 'Pending' ? '#b91c1c' : '#d0c4a0', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.type === 'payment' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {item.type === 'payment' ? '💳' : '📋'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: item.status === 'Pending' ? '#b91c1c' : '#888', marginTop: '2px' }}>
                        Due {item.due} {item.amount && `· ${item.amount}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '3px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: ss.bg, color: ss.color }}>{item.status}</span>
                    {item.status === 'Pending' && (
                      <button style={{ padding: '6px 16px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        {item.type === 'payment' ? 'Pay Now' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}