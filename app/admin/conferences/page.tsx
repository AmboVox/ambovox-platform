'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_REQUESTS = [
  { id: 1, from: 'Mia Kim (Parent)', regarding: 'Jordan Kim — Algebra I grade concern', with: 'Ms. Hart', preferred: 'Any afternoon this week', status: 'Pending' },
  { id: 2, from: 'Robert Ellis (Parent)', regarding: 'Devon Ellis — attendance and grades', with: 'Dr. Osei (Admin)', preferred: 'Thu or Fri afternoon', status: 'Urgent' },
  { id: 3, from: 'Ms. Hart (Teacher)', regarding: 'Jordan Kim — college readiness', with: 'Mr. Patel', preferred: 'Flexible', status: 'Accepted' },
  { id: 4, from: 'Carlos Rivera (Parent)', regarding: 'Marco Rivera — reading level', with: 'Ms. Alvarez', preferred: 'Mon or Tue morning', status: 'Pending' },
]

export default function ConferencesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState(DEMO_REQUESTS)
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

  function accept(id: number) {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Accepted' } : r))
  }

  function decline(id: number) {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Declined' } : r))
  }

  const statusColor = (s: string) => {
    if (s === 'Accepted') return { bg: '#d4edda', color: '#155724' }
    if (s === 'Urgent') return { bg: '#f8d7da', color: '#721c24' }
    if (s === 'Declined') return { bg: '#e8e0d0', color: '#555' }
    return { bg: '#fff3cd', color: '#856404' }
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/conferences" />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Conference Requests</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Schedule Conference</button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Pending', value: requests.filter(r => r.status === 'Pending' || r.status === 'Urgent').length.toString() },
              { label: 'Accepted', value: requests.filter(r => r.status === 'Accepted').length.toString() },
              { label: 'Total This Month', value: requests.length.toString() },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>All Conference Requests</div>
            <div style={{ padding: '8px 0' }}>
              {requests.map(r => {
                const sc = statusColor(r.status)
                return (
                  <div key={r.id} style={{ padding: '12px 16px', borderBottom: '1px solid #ede8dc', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#5B2C83', marginBottom: '2px' }}>{r.from}</div>
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px' }}>{r.regarding}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>With: {r.with} · Preferred: {r.preferred}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{r.status}</span>
                      {(r.status === 'Pending' || r.status === 'Urgent') && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => accept(r.id)} style={{ fontSize: '11px', padding: '3px 10px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                          <button onClick={() => decline(r.id)} style={{ fontSize: '11px', padding: '3px 10px', background: '#8C1D2C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Decline</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}