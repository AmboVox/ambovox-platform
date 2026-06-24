'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ParentSidebar from '@/components/layout/ParentSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_CHILDREN = [
  { id: 'child-1', name: 'Emma Smith', grade: 7 },
  { id: 'child-2', name: 'James Smith', grade: 4 },
]

const MOCK_ASSIGNMENTS: Record<string, any[]> = {
  'child-1': [
    { subject: 'Latin', title: 'Declension Worksheet — Unit 9', due: 'Jun 25', status: 'Pending', score: null },
    { subject: 'Algebra I', title: 'Chapter 12 Problem Set', due: 'Jun 25', status: 'Pending', score: null },
    { subject: 'Classical Literature', title: 'Essay — The Odyssey', due: 'Jun 27', status: 'Pending', score: null },
    { subject: 'History of Christendom', title: 'Timeline Project', due: 'Jun 24', status: 'Submitted', score: null },
    { subject: 'Natural Philosophy', title: 'Lab Report — Motion', due: 'Jun 20', status: 'Graded', score: '94%' },
    { subject: 'Rhetoric', title: 'Persuasive Speech Draft', due: 'Jun 18', status: 'Graded', score: '88%' },
    { subject: 'Latin', title: 'Vocabulary Quiz — Unit 8', due: 'Jun 15', status: 'Graded', score: '96%' },
    { subject: 'Algebra I', title: 'Chapter 11 Test', due: 'Jun 13', status: 'Graded', score: '85%' },
  ],
  'child-2': [
    { subject: 'Phonics & Reading', title: 'Reading Log — Week 36', due: 'Jun 25', status: 'Pending', score: null },
    { subject: 'Arithmetic', title: 'Multiplication Practice Sheet', due: 'Jun 24', status: 'Submitted', score: null },
    { subject: 'Scripture Memory', title: 'Psalm 23 Recitation', due: 'Jun 26', status: 'Pending', score: null },
    { subject: 'Handwriting', title: 'Cursive Practice — Page 44', due: 'Jun 20', status: 'Graded', score: '95%' },
    { subject: 'History & Geography', title: 'Map Quiz — US States', due: 'Jun 18', status: 'Graded', score: '92%' },
    { subject: 'Arithmetic', title: 'Division Unit Test', due: 'Jun 15', status: 'Graded', score: '89%' },
  ],
}

const STATUS_FILTERS = ['All', 'Pending', 'Submitted', 'Graded']

export default function ParentAssignmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [filter, setFilter] = useState('All')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'parent') { router.push('/login'); return }
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

  const activeChild = MOCK_CHILDREN.find(c => c.id === activeChildId)!
  const allAssignments = MOCK_ASSIGNMENTS[activeChildId]
  const filtered = filter === 'All' ? allAssignments : allAssignments.filter(a => a.status === filter)

  function statusStyle(s: string) {
    if (s === 'Graded') return { color: '#1d6a3a', bg: '#d1fae5' }
    if (s === 'Submitted') return { color: '#1A3A5C', bg: '#dbeafe' }
    return { color: '#b45309', bg: '#fef3c7' }
  }

  const pendingCount = allAssignments.filter(a => a.status === 'Pending').length

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/assignments"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
              {MOCK_CHILDREN.map(child => (
                <button key={child.id} onClick={() => setActiveChildId(child.id)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: activeChildId === child.id ? '#1A3A5C' : '#888' }}>
                  {child.name}
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: activeChildId === child.id ? '#C47A2C' : '#bbb' }}>Grade {child.grade}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>{activeChild.name} — Assignments</h1>
            {pendingCount > 0 && (
              <div style={{ background: '#fef3c7', border: '1px solid #b45309', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#b45309' }}>
                ⚠️ {pendingCount} assignment{pendingCount > 1 ? 's' : ''} pending
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: filter === f ? '2px solid #1A3A5C' : '1px solid #c8bea0', background: filter === f ? '#1A3A5C' : 'white', color: filter === f ? 'white' : '#555' }}>
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Subject', 'Assignment', 'Due Date', 'Status', 'Score'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#1A3A5C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const ss = statusStyle(a.status)
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: '#5B2C83' }}>{a.subject}</td>
                      <td style={{ padding: '10px 14px' }}>{a.title}</td>
                      <td style={{ padding: '10px 14px', color: a.status === 'Pending' ? '#b91c1c' : '#777', fontWeight: a.status === 'Pending' ? '600' : '400' }}>{a.due}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', background: ss.bg, color: ss.color }}>{a.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#1d6a3a' }}>{a.score || '—'}</td>
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