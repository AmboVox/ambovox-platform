'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const INELIGIBLE_STUDENTS = [
  { id: 1, name: 'Devon Ellis', grade: '10', reason: 'F grade — Algebra I, Biology', since: 'Spring 2026' },
  { id: 2, name: 'Marcus Webb', grade: '7', reason: 'GPA below 2.0 (1.8)', since: 'Fall 2025' },
]

const SPORTS = [
  { id: 1, name: 'Cross Country', season: 'Fall', level: 'High School', roster: 12, coach: 'Coach Miller' },
  { id: 2, name: 'Basketball', season: 'Winter', level: 'High School', roster: 10, coach: 'Coach Miller' },
  { id: 3, name: 'Soccer', season: 'Spring', level: 'Middle/High', roster: 18, coach: 'Coach Davis' },
  { id: 4, name: 'Track & Field', season: 'Spring', level: 'Middle/High', roster: 22, coach: 'Coach Miller' },
  { id: 5, name: 'Volleyball', season: 'Fall', level: 'Middle/High', roster: 14, coach: 'Coach Davis' },
  { id: 6, name: 'Baseball', season: 'Spring', level: 'High School', roster: 15, coach: 'Coach Thompson' },
]

export default function AthleticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [minGPA, setMinGPA] = useState('2.0')
  const [showEdit, setShowEdit] = useState(false)
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/athletics" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Athletics</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Add Sport
            </button>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-purple-900">Eligibility Settings — 2025–2026</h2>
              <button onClick={() => setShowEdit(!showEdit)} style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>
                {showEdit ? 'Cancel' : 'Edit Settings'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div style={{ background: '#f9f6ee', borderRadius: '6px', padding: '12px', border: '1px solid #e8e0d0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Minimum GPA (Unweighted)</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#C47A2C' }}>{minGPA}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Set by admin · 2025–2026</div>
              </div>
              <div style={{ background: '#f9f6ee', borderRadius: '6px', padding: '12px', border: '1px solid #e8e0d0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Hard Rule</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>No F Grades</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Non-negotiable · Cannot be waived</div>
              </div>
            </div>
            {showEdit && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fdebd0', borderRadius: '6px', borderLeft: '3px solid #C47A2C' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>Set GPA Minimum for 2026–2027</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select value={minGPA} onChange={(e) => setMinGPA(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>1.5</option>
                    <option>2.0</option>
                    <option>2.5</option>
                    <option>3.0</option>
                  </select>
                  <button style={{ padding: '6px 14px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Save for Next Year</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Eligible Students', value: '186', sub: 'Middle & High' },
              { label: 'Ineligible', value: INELIGIBLE_STUDENTS.length.toString(), sub: 'GPA or F grade' },
              { label: 'Active Sports', value: SPORTS.length.toString(), sub: 'this semester' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Ineligible Students</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Student','Grade','Reason','Since'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INELIGIBLE_STUDENTS.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '8px 14px' }}>{s.grade}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#f8d7da', color: '#721c24' }}>{s.reason}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{s.since}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontWeight: '700', color: '#5B2C83' }}>Active Sports</div>
                <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Add</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Sport','Season','Roster','Coach'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPORTS.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '8px 14px' }}>{s.season}</td>
                      <td style={{ padding: '8px 14px' }}>{s.roster}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{s.coach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}