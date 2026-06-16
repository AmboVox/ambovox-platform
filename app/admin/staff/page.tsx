'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_STAFF = [
  { id: 1, name: 'Ms. Elena Hart', role: 'Teacher', department: 'Mathematics', level: 'High School', training: '1 overdue', status: 'Active' },
  { id: 2, name: 'Mr. Raj Patel', role: 'Teacher', department: 'English', level: 'Middle School', training: 'Complete', status: 'Active' },
  { id: 3, name: 'Ms. Rosa Alvarez', role: 'Teacher', department: 'K-2 General', level: 'Elementary', training: '1 overdue', status: 'Active' },
  { id: 4, name: 'Dr. Lin Yuen', role: 'Teacher', department: 'Science', level: 'High School', training: 'Complete', status: 'Active' },
  { id: 5, name: 'Mr. James Ford', role: 'Teacher', department: '3-5 General', level: 'Elementary', training: 'Complete', status: 'Active' },
  { id: 6, name: 'Dr. Samuel Osei', role: 'Principal', department: 'Administration', level: 'All Levels', training: 'Complete', status: 'Active' },
]

export default function StaffPage() {
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

  const filtered = DEMO_STAFF.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.level.toLowerCase().includes(search.toLowerCase())
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/staff" />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Staff</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Add Staff</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Staff', value: DEMO_STAFF.length.toString() },
              { label: 'Training Overdue', value: DEMO_STAFF.filter(s => s.training.includes('overdue')).length.toString() },
              { label: 'Training Complete', value: DEMO_STAFF.filter(s => s.training === 'Complete').length.toString() },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>Staff Directory</div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." style={{ padding: '5px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '180px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Name','Role','Department','Level','Training','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                    <td style={{ padding: '8px 14px' }}>{s.role}</td>
                    <td style={{ padding: '8px 14px', color: '#888' }}>{s.department}</td>
                    <td style={{ padding: '8px 14px' }}>{s.level}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: s.training === 'Complete' ? '#d4edda' : '#fff3cd', color: s.training === 'Complete' ? '#155724' : '#856404' }}>
                        {s.training}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#d4edda', color: '#155724' }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Edit</button>
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