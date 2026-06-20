'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PROTOCOLS = [
  { id: 1, title: 'Flipped Classroom Policy', type: 'SOP', version: 'V1.0', tier: 'Read & Sign', approved: 'May 28, 2026' },
  { id: 2, title: 'Assessment Integrity Protocol', type: 'SOP', version: 'V2.0', tier: 'Quiz Required', approved: 'May 20, 2026' },
  { id: 3, title: 'Field Trip Permission Process', type: 'Work Instruction', version: 'V1.0', tier: 'Reference Only', approved: 'Apr 15, 2026' },
  { id: 4, title: 'Health Emergency Response', type: 'SOP', version: 'V1.0', tier: 'Quiz Required', approved: 'Mar 1, 2026' },
]

export default function EffectiveProtocolsPage() {
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

  const filtered = PROTOCOLS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  const tierColor = (t: string) => t === 'Quiz Required' ? { bg: '#f8d7da', color: '#721c24' } : t === 'Read & Sign' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8f0fc', color: '#004085' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/training/effective" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#C47A2C' }}>Effective Protocols</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            The living reference library of all current-version approved SOPs and Work Instructions. Browsable anytime by Admin, Teachers, and Teaching Assistants.
          </p>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>All Effective Protocols</div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search protocols..." style={{ padding: '5px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '180px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Title','Type','Version','Tier','Approved',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const tc = tierColor(p.tier)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{p.title}</td>
                      <td style={{ padding: '8px 14px', color: '#888' }}>{p.type}</td>
                      <td style={{ padding: '8px 14px' }}>{p.version}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: tc.bg, color: tc.color }}>{p.tier}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{p.approved}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
                      </td>
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