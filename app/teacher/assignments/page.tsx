'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const ASSIGNMENTS = [
  { id: 1, name: 'HW #4', type: 'Learning', lock: 'Never locks', assigned: 'All', submitted: '26/28' },
  { id: 2, name: 'Unit Quiz 2', type: 'Quiz', lock: 'Locks', assigned: 'All', submitted: '24/28' },
  { id: 3, name: 'Module 1 Test', type: 'Test', lock: 'Locks', assigned: 'All', submitted: '20/28' },
  { id: 4, name: 'Makeup: Quiz 2', type: 'Quiz', lock: 'Locks', assigned: 'Ben C, Devon E', submitted: '0/2' },
]

type SortKey = 'name' | 'type' | 'lock' | 'assigned' | 'submitted'

export default function TeacherAssignmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [filterType, setFilterType] = useState('all')
  const [filterLock, setFilterLock] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || (profile.role !== 'teacher' && profile.role !== 'teaching_assistant')) { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let rows = ASSIGNMENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterType === 'all' || a.type === filterType) &&
    (filterLock === 'all' || a.lock === filterLock)
  )

  rows = [...rows].sort((a, b) => {
    const va = a[sortKey].toString().toLowerCase()
    const vb = b[sortKey].toString().toLowerCase()
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'
  const tc = (t: string) => t === 'Test' ? { bg: '#f8d7da', color: '#721c24' } : t === 'Quiz' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8e0d0', color: '#555' }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        onClick={() => toggleSort(k)}
        style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0', cursor: 'pointer', userSelect: 'none' }}
      >
        {label} {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </th>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/assignments" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Assignments</h1>
            <button style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>New</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments..."
              style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '200px' }}
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
              <option value="all">All Types</option>
              <option value="Learning">Learning</option>
              <option value="Quiz">Quiz</option>
              <option value="Test">Test</option>
            </select>
            <select value={filterLock} onChange={(e) => setFilterLock(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
              <option value="all">All Lock Policies</option>
              <option value="Never locks">Never locks</option>
              <option value="Locks">Locks</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  <SortHeader label="Assignment" k="name" />
                  <SortHeader label="Type" k="type" />
                  <SortHeader label="Lock Policy" k="lock" />
                  <SortHeader label="Assigned To" k="assigned" />
                  <SortHeader label="Submitted" k="submitted" />
                  <th style={{ padding: '8px 14px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(a => {
                  const c = tc(a.type)
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{a.name}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: c.bg, color: c.color }}>{a.type}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{a.lock}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px' }}>{a.assigned}</td>
                      <td style={{ padding: '8px 14px' }}>{a.submitted}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Grade</button>
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>No assignments match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}