'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_STUDENTS = [
  { id: 1, name: 'Jordan Kim', grade: 10, level: 'High School', parent: 'Mia Kim', gpa: '3.42', attendance: '96%', status: 'Active' },
  { id: 2, name: 'Alex Kim', grade: 3, level: 'Elementary', parent: 'Mia Kim', gpa: 'N/A', attendance: '98%', status: 'Active' },
  { id: 3, name: 'Devon Ellis', grade: 10, level: 'High School', parent: 'Robert Ellis', gpa: '1.82', attendance: '71%', status: 'At Risk' },
  { id: 4, name: 'Priya Anand', grade: 7, level: 'Middle School', parent: 'Raj Anand', gpa: '2.90', attendance: '88%', status: 'Watch' },
  { id: 5, name: 'Chloe Dumont', grade: 9, level: 'High School', parent: 'Anne Dumont', gpa: '4.00', attendance: '99%', status: 'Active' },
  { id: 6, name: 'Lily Chen', grade: 1, level: 'Elementary', parent: 'Wei Chen', gpa: 'N/A', attendance: '97%', status: 'Active' },
  { id: 7, name: 'Marco Rivera', grade: 4, level: 'Elementary', parent: 'Carlos Rivera', gpa: 'N/A', attendance: '95%', status: 'Active' },
]

export default function StudentsPage() {
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

  const filtered = DEMO_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.level.toLowerCase().includes(search.toLowerCase()) ||
    s.parent.toLowerCase().includes(search.toLowerCase())
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/students" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Students</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Add Student
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Enrolled', value: DEMO_STUDENTS.length.toString() },
              { label: 'At Risk', value: DEMO_STUDENTS.filter(s => s.status === 'At Risk').toString().length.toString() },
              { label: 'Avg Attendance', value: '94%' },
              { label: 'Watching', value: DEMO_STUDENTS.filter(s => s.status === 'Watch').length.toString() },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>Student Roster</div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                style={{ padding: '5px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '180px' }}
              />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Name','Grade','Level','Parent','GPA','Attendance','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                    <td style={{ padding: '8px 14px' }}>{s.grade === 0 ? 'K' : s.grade}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: s.level === 'High School' ? '#d4f0e4' : s.level === 'Middle School' ? '#f8d7da' : '#cce5ff', color: s.level === 'High School' ? '#0a5c35' : s.level === 'Middle School' ? '#721c24' : '#004085' }}>
                        {s.level}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', color: '#888' }}>{s.parent}</td>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.gpa}</td>
                    <td style={{ padding: '8px 14px' }}>{s.attendance}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: s.status === 'Active' ? '#d4edda' : s.status === 'At Risk' ? '#f8d7da' : '#fff3cd', color: s.status === 'Active' ? '#155724' : s.status === 'At Risk' ? '#721c24' : '#856404' }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
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