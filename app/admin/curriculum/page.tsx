'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_SUBJECTS = [
  { id: 1, name: 'Mathematics', levels: 'K-12', courses: 8 },
  { id: 2, name: 'English / Language Arts', levels: 'K-12', courses: 6 },
  { id: 3, name: 'Theology / Bible', levels: 'K-12', courses: 12 },
  { id: 4, name: 'Sciences', levels: '3-12', courses: 7 },
  { id: 5, name: 'History', levels: 'K-12', courses: 8 },
  { id: 6, name: 'Arts', levels: 'K-12', courses: 4 },
  { id: 7, name: 'Physical Education', levels: 'K-12', courses: 2 },
  { id: 8, name: 'Foreign Language', levels: '6-12', courses: 4 },
]

const DEMO_COURSES = [
  { id: 1, name: 'Algebra I', subject: 'Mathematics', level: 'High School', type: 'Standard', credits: '1.0', status: 'Active' },
  { id: 2, name: 'Pre-Calculus', subject: 'Mathematics', level: 'High School', type: 'Honors', credits: '1.0', status: 'Active' },
  { id: 3, name: 'AP Calculus', subject: 'Mathematics', level: 'High School', type: 'AP/College', credits: '1.0', status: 'Active' },
  { id: 4, name: 'English Literature', subject: 'English / Language Arts', level: 'High School', type: 'Standard', credits: '1.0', status: 'Active' },
  { id: 5, name: 'Bible Studies I', subject: 'Theology / Bible', level: 'High School', type: 'Standard', credits: '1.0', status: 'Active' },
  { id: 6, name: 'Biology', subject: 'Sciences', level: 'High School', type: 'Standard', credits: '1.0', status: 'Active' },
  { id: 7, name: 'AP Biology', subject: 'Sciences', level: 'High School', type: 'AP/College', credits: '1.0', status: 'Pending' },
  { id: 8, name: 'Math 7', subject: 'Mathematics', level: 'Middle School', type: 'Standard', credits: '1.0', status: 'Active' },
]

export default function CurriculumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'subjects'|'courses'>('subjects')
  const [showNewSubject, setShowNewSubject] = useState(false)
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [subjects, setSubjects] = useState(DEMO_SUBJECTS)
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

  function addSubject() {
    if (!newSubjectName) return
    setSubjects([...subjects, { id: Date.now(), name: newSubjectName, levels: 'K-12', courses: 0 }])
    setNewSubjectName('')
    setShowNewSubject(false)
  }

  const typeColor = (t: string) => t === 'AP/College' ? { bg: '#f8d7da', color: '#721c24' } : t === 'Honors' ? { bg: '#ede0f8', color: '#4a1a72' } : { bg: '#e8e0d0', color: '#555' }
  const statusColor = (s: string) => s === 'Active' ? { bg: '#d4edda', color: '#155724' } : { bg: '#fff3cd', color: '#856404' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/curriculum" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Curriculum</h1>
            <button
              onClick={() => tab === 'subjects' ? setShowNewSubject(!showNewSubject) : setShowNewCourse(!showNewCourse)}
              style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {tab === 'subjects' ? 'New Subject Area' : 'Add Course'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #d0c4a0' }}>
            {(['subjects', 'courses'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: tab === t ? '2px solid #C47A2C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === t ? '#C47A2C' : '#888', textTransform: 'capitalize' }}>
                {t === 'subjects' ? 'Subject Areas' : 'All Courses'}
              </button>
            ))}
          </div>

          {tab === 'subjects' && (
            <>
              {showNewSubject && (
                <div className="bg-white rounded-lg border p-4 mb-4" style={{ borderColor: '#d0c4a0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '10px' }}>New Subject Area</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject name (e.g. Classical Languages)" style={{ flex: 1, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                    <button onClick={addSubject} style={{ padding: '7px 14px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Add</button>
                    <button onClick={() => setShowNewSubject(false)} style={{ padding: '7px 14px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f9f6ee' }}>
                      {['Subject Area','Levels','Courses',''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                        <td style={{ padding: '8px 14px', fontWeight: '600' }}>{s.name}</td>
                        <td style={{ padding: '8px 14px', color: '#888' }}>{s.levels}</td>
                        <td style={{ padding: '8px 14px' }}>{s.courses} courses</td>
                        <td style={{ padding: '8px 14px' }}>
                          <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'courses' && (
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Course','Subject','Level','Type','Credits','Status',''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_COURSES.map(c => {
                    const tc = typeColor(c.type)
                    const sc = statusColor(c.status)
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                        <td style={{ padding: '8px 14px', fontWeight: '600' }}>{c.name}</td>
                        <td style={{ padding: '8px 14px', color: '#888', fontSize: '11px' }}>{c.subject}</td>
                        <td style={{ padding: '8px 14px', fontSize: '11px' }}>{c.level}</td>
                        <td style={{ padding: '8px 14px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: tc.bg, color: tc.color }}>{c.type}</span>
                        </td>
                        <td style={{ padding: '8px 14px' }}>{c.credits}</td>
                        <td style={{ padding: '8px 14px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{c.status}</span>
                        </td>
                        <td style={{ padding: '8px 14px' }}>
                          <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Edit</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}