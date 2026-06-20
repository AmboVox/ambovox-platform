'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const COMPLETED = [
  { id: 1, title: 'New Curriculum Builder Walkthrough', person: 'Ms. Hart', completed: 'May 25, 2026 · 9:14 AM', method: 'Read & Sign' },
  { id: 2, title: 'New Curriculum Builder Walkthrough', person: 'Mr. Patel', completed: 'May 24, 2026 · 2:30 PM', method: 'Read & Sign' },
  { id: 3, title: 'Assessment Integrity Protocol', person: 'Ms. Alvarez', completed: 'May 20, 2026 · 11:05 AM', method: 'Quiz Required — Passed' },
  { id: 4, title: '2026-2027 Academic Calendar Preview', person: 'Dr. Yuen', completed: 'May 15, 2026 · 8:50 AM', method: 'Read & Sign' },
]

export default function CompletedTrainingPage() {
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

  const filtered = COMPLETED.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.person.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/training/completed" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#C47A2C' }}>Completed Training</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            Permanent record of every training item staff have completed, including audit timestamps.
          </p>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>Completion Records</div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or staff..." style={{ padding: '5px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '200px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Document','Staff Member','Completed','Method',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{c.title}</td>
                    <td style={{ padding: '8px 14px' }}>{c.person}</td>
                    <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{c.completed}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#d4edda', color: '#155724' }}>{c.method}</span>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View Audit Log</button>
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