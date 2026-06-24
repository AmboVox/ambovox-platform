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

const MOCK_DATA: Record<string, any> = {
  'child-1': {
    gpa: '3.84',
    attendance: '97%',
    pendingForms: 2,
    nextEvent: 'Parent-Teacher Conf. — Jun 28',
    recentGrades: [
      { subject: 'Latin', grade: 'A', score: '96%', date: 'Jun 20' },
      { subject: 'Classical Literature', grade: 'A-', score: '91%', date: 'Jun 18' },
      { subject: 'Algebra I', grade: 'B+', score: '88%', date: 'Jun 17' },
      { subject: 'History of Christendom', grade: 'A', score: '94%', date: 'Jun 15' },
    ],
    announcements: [
      { title: 'End-of-Year Ceremony', date: 'Jun 27', urgent: false },
      { title: 'Uniform Policy Reminder', date: 'Jun 22', urgent: true },
      { title: 'Summer Reading List Posted', date: 'Jun 20', urgent: false },
    ],
    pendingItems: [
      { label: 'Permission Slip — Field Trip', due: 'Jun 25', type: 'form' },
      { label: 'Tuition Payment — July', due: 'Jul 1', type: 'payment' },
    ],
  },
  'child-2': {
    gpa: '3.60',
    attendance: '99%',
    pendingForms: 1,
    nextEvent: 'Field Day — Jun 26',
    recentGrades: [
      { subject: 'Phonics & Reading', grade: 'A', score: '98%', date: 'Jun 20' },
      { subject: 'Arithmetic', grade: 'A-', score: '92%', date: 'Jun 18' },
      { subject: 'Handwriting', grade: 'A', score: '95%', date: 'Jun 17' },
      { subject: 'Scripture Memory', grade: 'A+', score: '100%', date: 'Jun 15' },
    ],
    announcements: [
      { title: 'End-of-Year Ceremony', date: 'Jun 27', urgent: false },
      { title: 'Field Day Volunteers Needed', date: 'Jun 21', urgent: false },
    ],
    pendingItems: [
      { label: 'Field Day Permission Slip', due: 'Jun 24', type: 'form' },
    ],
  },
}

export default function ParentDashboard() {
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

  const activeChild = MOCK_CHILDREN.find(c => c.id === activeChildId)!
  const data = MOCK_DATA[activeChildId]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent"
          badges={{ announcements: 1, messages: 3, forms: data.pendingForms }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
              {MOCK_CHILDREN.map(child => (
                <button
                  key={child.id}
                  onClick={() => setActiveChildId(child.id)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent',
                    marginBottom: '-2px',
                    background: 'transparent',
                    color: activeChildId === child.id ? '#1A3A5C' : '#888',
                  }}
                >
                  {child.name}
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: activeChildId === child.id ? '#C47A2C' : '#bbb' }}>
                    Grade {child.grade}
                  </span>
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>
            {activeChild.name}'s Dashboard
          </h1>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'GPA', value: data.gpa, sub: 'current term', color: '#1A3A5C' },
              { label: 'Attendance', value: data.attendance, sub: 'this year', color: '#1d6a3a' },
              { label: 'Pending Items', value: String(data.pendingForms), sub: 'need attention', color: '#b91c1c' },
              { label: 'Next Event', value: '📅', sub: data.nextEvent, color: '#b45309' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: card.label === 'Next Event' ? '20px' : '26px', fontWeight: '700', color: card.color }}>{card.value}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="font-bold" style={{ fontSize: '13px', color: '#5B2C83' }}>Recent Grades</div>
                <span style={{ fontSize: '11px', color: '#C47A2C', cursor: 'pointer' }}>View all →</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Subject', 'Grade', 'Score', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 14px', fontSize: '10px', fontWeight: '600', color: '#1A3A5C', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentGrades.map((g: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '500' }}>{g.subject}</td>
                      <td style={{ padding: '8px 14px', fontWeight: '700', color: g.grade.startsWith('A') ? '#1d6a3a' : g.grade.startsWith('B') ? '#1A3A5C' : '#b45309' }}>{g.grade}</td>
                      <td style={{ padding: '8px 14px', color: '#555' }}>{g.score}</td>
                      <td style={{ padding: '8px 14px', color: '#aaa', fontSize: '11px' }}>{g.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="font-bold" style={{ fontSize: '13px', color: '#5B2C83' }}>Pending Items</div>
                  <span style={{ fontSize: '11px', color: '#C47A2C', cursor: 'pointer' }}>View all →</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {data.pendingItems.length === 0 ? (
                    <div style={{ padding: '12px', fontSize: '12px', color: '#aaa', textAlign: 'center' }}>All caught up! ✓</div>
                  ) : data.pendingItems.map((item: any, i: number) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: '6px', marginBottom: '4px', background: item.type === 'payment' ? '#fef3c7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>{item.label}</div>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Due {item.due}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: item.type === 'payment' ? '#b45309' : '#b91c1c', color: 'white' }}>
                        {item.type === 'payment' ? 'Payment' : 'Form'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="font-bold" style={{ fontSize: '13px', color: '#5B2C83' }}>Announcements</div>
                  <span style={{ fontSize: '11px', color: '#C47A2C', cursor: 'pointer' }}>View all →</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {data.announcements.map((ann: any, i: number) => (
                    <div key={i} style={{ padding: '9px 12px', borderRadius: '6px', marginBottom: '4px', background: ann.urgent ? '#fef3c7' : '#f9f6ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: ann.urgent ? '700' : '500', color: ann.urgent ? '#b45309' : '#333' }}>
                        {ann.urgent && '⚠️ '}{ann.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#aaa', flexShrink: 0, marginLeft: '8px' }}>{ann.date}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}