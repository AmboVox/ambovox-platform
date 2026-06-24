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

const MOCK_GRADES: Record<string, any[]> = {
  'child-1': [
    { subject: 'Latin', teacher: 'Mr. Donaldson', q1: 'A', q2: 'A-', q3: 'B+', q4: '-', current: '96%', gpa: '4.0' },
    { subject: 'Classical Literature', teacher: 'Mrs. Alcott', q1: 'B+', q2: 'A-', q3: 'A', q4: '-', current: '91%', gpa: '3.7' },
    { subject: 'Algebra I', teacher: 'Ms. Hart', q1: 'B', q2: 'B+', q3: 'B+', q4: '-', current: '88%', gpa: '3.3' },
    { subject: 'History of Christendom', teacher: 'Mr. Wells', q1: 'A', q2: 'A', q3: 'A', q4: '-', current: '94%', gpa: '4.0' },
    { subject: 'Natural Philosophy', teacher: 'Dr. Marsh', q1: 'A-', q2: 'B+', q3: 'A-', q4: '-', current: '90%', gpa: '3.7' },
    { subject: 'Rhetoric', teacher: 'Mrs. Alcott', q1: 'B+', q2: 'A-', q3: 'A-', q4: '-', current: '89%', gpa: '3.7' },
  ],
  'child-2': [
    { subject: 'Phonics & Reading', teacher: 'Mrs. Cole', q1: 'A', q2: 'A', q3: 'A', q4: '-', current: '98%', gpa: '4.0' },
    { subject: 'Arithmetic', teacher: 'Ms. Hart', q1: 'A-', q2: 'A-', q3: 'B+', q4: '-', current: '92%', gpa: '3.7' },
    { subject: 'Handwriting', teacher: 'Mrs. Cole', q1: 'A', q2: 'A', q3: 'A', q4: '-', current: '95%', gpa: '4.0' },
    { subject: 'Scripture Memory', teacher: 'Mr. Wells', q1: 'A+', q2: 'A+', q3: 'A+', q4: '-', current: '100%', gpa: '4.0' },
    { subject: 'History & Geography', teacher: 'Mr. Wells', q1: 'A', q2: 'A-', q3: 'A', q4: '-', current: '93%', gpa: '4.0' },
  ],
}

export default function ParentGradesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
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

  const grades = MOCK_GRADES[activeChildId]
  const activeChild = MOCK_CHILDREN.find(c => c.id === activeChildId)!
  const gpaAvg = (grades.reduce((a, c) => a + parseFloat(c.gpa), 0) / grades.length).toFixed(2)

  function gradeColor(g: string) {
    if (g.startsWith('A')) return '#1d6a3a'
    if (g.startsWith('B')) return '#1A3A5C'
    if (g.startsWith('C')) return '#b45309'
    return '#b91c1c'
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/grades"
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
            <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>{activeChild.name} — Grades</h1>
            <div style={{ background: 'white', border: '1px solid #d0c4a0', borderRadius: '8px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current GPA</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1A3A5C' }}>{gpaAvg}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Subject', 'Teacher', 'Q1', 'Q2', 'Q3', 'Q4', 'Current', 'GPA'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#1A3A5C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ede8dc' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{g.subject}</td>
                    <td style={{ padding: '10px 14px', color: '#777' }}>{g.teacher}</td>
                    {[g.q1, g.q2, g.q3, g.q4].map((q, qi) => (
                      <td key={qi} style={{ padding: '10px 14px', fontWeight: '700', color: q === '-' ? '#ccc' : gradeColor(q) }}>{q}</td>
                    ))}
                    <td style={{ padding: '10px 14px', fontWeight: '600', color: '#333' }}>{g.current}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: gradeColor(g.q3) }}>{g.gpa}</td>
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