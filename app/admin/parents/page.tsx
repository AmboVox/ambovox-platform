'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_PARENTS = [
  { id: 1, name: 'Mia Kim', children: 'Jordan Kim (Gr 10), Alex Kim (Gr 3)', email: 'mia.kim@email.com', phone: '(555) 010-2030', status: 'Active' },
  { id: 2, name: 'Robert Ellis', children: 'Devon Ellis (Gr 10)', email: 'robert.ellis@email.com', phone: '(555) 010-4050', status: 'Active' },
  { id: 3, name: 'Raj Anand', children: 'Priya Anand (Gr 7)', email: 'raj.anand@email.com', phone: '(555) 010-6070', status: 'Active' },
  { id: 4, name: 'Anne Dumont', children: 'Chloe Dumont (Gr 9)', email: 'anne.dumont@email.com', phone: '(555) 010-8090', status: 'Active' },
  { id: 5, name: 'Wei Chen', children: 'Lily Chen (Gr 1)', email: 'wei.chen@email.com', phone: '(555) 010-1112', status: 'Active' },
  { id: 6, name: 'Carlos Rivera', children: 'Marco Rivera (Gr 4)', email: 'carlos.rivera@email.com', phone: '(555) 010-1314', status: 'Active' },
]

export default function ParentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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

  const filtered = DEMO_PARENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.children.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/parents" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Parents</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Add Parent Account
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Parent Accounts', value: DEMO_PARENTS.length.toString() },
              { label: 'Linked Students', value: '7' },
              { label: 'Multi-Child Families', value: '1' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>Parent Directory</div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parents..." style={{ padding: '5px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '180px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Name','Children','Email','Phone','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{p.name}</td>
                    <td style={{ padding: '8px 14px', color: '#888', fontSize: '11px' }}>{p.children}</td>
                    <td style={{ padding: '8px 14px', fontSize: '11px' }}>{p.email}</td>
                    <td style={{ padding: '8px 14px', fontSize: '11px' }}>{p.phone}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#d4edda', color: '#155724' }}>{p.status}</span>
                    </td>
                   <td style={{ padding: '8px 14px', display: 'flex', gap: '4px' }}>
                      <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
                      <button
                        onClick={() => router.push(`/admin/messages?to=${encodeURIComponent(p.name)}`)}
                        style={{ fontSize: '11px', padding: '3px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: '#C47A2C', color: 'white' }}
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}