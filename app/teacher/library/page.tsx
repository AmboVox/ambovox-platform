'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const VIDEOS = [
  { id: 1, title: 'real-numbers.mp4', course: 'Algebra I', duration: '18:42', status: 'Published' },
  { id: 2, title: 'properties-ops.mp4', course: 'Algebra I', duration: '22:10', status: 'Processing' },
  { id: 3, title: 'quadratic-intro.mp4', course: 'Algebra I', duration: '31:05', status: 'Draft' },
]

type SortKey = 'title' | 'course' | 'duration' | 'status'

export default function LecturelibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
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
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  let rows = VIDEOS.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === 'all' || v.status === filterStatus)
  )
  rows = [...rows].sort((a, b) => {
    const va = a[sortKey].toLowerCase()
    const vb = b[sortKey].toLowerCase()
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
  const sc = (s: string) => s === 'Published' ? { bg: '#d4edda', color: '#155724' } : s === 'Processing' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8e0d0', color: '#555' }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <th onClick={() => toggleSort(k)} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0', cursor: 'pointer', userSelect: 'none' }}>
        {label} {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : ''}
      </th>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/library" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Lecture Library</h1>
            <button style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Upload Video</button>
          </div>
          <div style={{ background: '#e8f0fc', color: '#1a4a8a', borderLeft: '3px solid #275FA8', padding: '9px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
            All lecture videos are permanently accessible to students and parents once published.
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos..." style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '200px' }} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Processing">Processing</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  <SortHeader label="Title" k="title" />
                  <SortHeader label="Course" k="course" />
                  <SortHeader label="Duration" k="duration" />
                  <SortHeader label="Status" k="status" />
                  <th style={{ padding: '8px 14px' }}>Lock Policy</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(v => {
                  const c = sc(v.status)
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{v.title}</td>
                      <td style={{ padding: '8px 14px' }}>{v.course}</td>
                      <td style={{ padding: '8px 14px' }}>{v.duration}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: c.bg, color: c.color }}>{v.status}</span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: '#d4f0e4', color: '#0a5c35' }}>Never locks</span>
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