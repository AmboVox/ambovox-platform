'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PRINCIPALS_LIST = [
  { id: 1, name: 'Chloe Dumont', grade: '9', level: 'High', gpa: '4.00' },
  { id: 2, name: 'Jordan Kim', grade: '10', level: 'High', gpa: '3.90' },
  { id: 3, name: 'Aaliyah Brooks', grade: '10', level: 'High', gpa: '3.87' },
]

const HONOR_ROLL = [
  { id: 4, name: 'Priya Anand', grade: '7', level: 'Middle', gpa: '3.40' },
  { id: 5, name: 'Elena Fuentes', grade: '10', level: 'High', gpa: '3.35' },
  { id: 6, name: 'Ben Castillo', grade: '10', level: 'High', gpa: '3.20' },
]

const INELIGIBLE = [
  { id: 7, name: 'Devon Ellis', grade: '10', reason: 'F class grade', classes: 'Algebra I, Biology, English' },
  { id: 8, name: 'Marcus Webb', grade: '7', reason: 'F class grade', classes: 'Math 7' },
]

export default function HonorRollPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/honor-roll" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Honor Roll</h1>
            <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Export List
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            Calculated each semester using unweighted grades only. No student with a failing class grade (F) may appear on either list, regardless of overall GPA.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Principal's List</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{PRINCIPALS_LIST.length}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>All A's · No F grades</div>
            </div>
            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Honor Roll</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{HONOR_ROLL.length}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>A/B · No F grades</div>
            </div>
            <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Ineligible</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#C47A2C' }}>{INELIGIBLE.length}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>F in one or more classes</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>🏅 Principal's List — Spring 2026</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Student','Grade','Level','GPA'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRINCIPALS_LIST.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '8px 14px' }}>{s.grade}</td>
                      <td style={{ padding: '8px 14px' }}>{s.level}</td>
                      <td style={{ padding: '8px 14px', fontWeight: '700' }}>{s.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>📋 Honor Roll — Spring 2026</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Student','Grade','Level','GPA'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HONOR_ROLL.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '8px 14px' }}>{s.grade}</td>
                      <td style={{ padding: '8px 14px' }}>{s.level}</td>
                      <td style={{ padding: '8px 14px', fontWeight: '700' }}>{s.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>⚠️ Ineligible This Semester</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Student','Grade','Reason','Failing Class(es)'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INELIGIBLE.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                    <td style={{ padding: '8px 14px' }}>{s.grade}</td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#f8d7da', color: '#721c24' }}>{s.reason}</span>
                    </td>
                    <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{s.classes}</td>
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