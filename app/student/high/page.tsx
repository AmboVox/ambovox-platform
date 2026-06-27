'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StudentSidebarHigh from '@/components/layout/StudentSidebarHigh'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_COURSES = [
  { subject: 'Rhetoric', teacher: 'Mrs. Alcott', progress: 82, grade: 'A-', emoji: '✍️' },
  { subject: 'Algebra II Honors', teacher: 'Ms. Hart', progress: 71, grade: 'B+', emoji: '📐' },
  { subject: 'History of Christendom', teacher: 'Mr. Wells', progress: 88, grade: 'A', emoji: '🌍' },
  { subject: 'Latin II', teacher: 'Mr. Donaldson', progress: 76, grade: 'A-', emoji: '📜' },
  { subject: 'Natural Philosophy', teacher: 'Dr. Marsh', progress: 69, grade: 'B+', emoji: '🔬' },
  { subject: 'Theology', teacher: 'Mr. Wells', progress: 91, grade: 'A', emoji: '✝️' },
]

const MOCK_ASSIGNMENTS = [
  { subject: 'Rhetoric', title: 'Persuasive Speech — Final Draft', due: 'Jun 25', urgent: true, emoji: '✍️' },
  { subject: 'Algebra II', title: 'Chapter 15 Problem Set', due: 'Jun 25', urgent: true, emoji: '📐' },
  { subject: 'Latin II', title: 'Translation — Caesar Book IV', due: 'Jun 27', urgent: false, emoji: '📜' },
  { subject: 'Natural Philosophy', title: 'Lab Report — Final', due: 'Jun 28', urgent: false, emoji: '🔬' },
]

const MOCK_ANNOUNCEMENTS = [
  { title: 'End-of-Year Ceremony — June 27th', date: 'Jun 22', urgent: false },
  { title: 'Honor Roll Posted — Spring Term', date: 'Jun 20', urgent: false },
  { title: 'Finals Schedule Released', date: 'Jun 18', urgent: true },
]

export default function HighStudentPortal() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'student') { router.push('/login'); return }
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

  const gpa = '3.84'
  const isHonorRoll = parseFloat(gpa) >= 3.5

  function gradeColor(g: string) {
    if (g.startsWith('A')) return '#1d6a3a'
    if (g.startsWith('B')) return '#1A3A5C'
    return '#b45309'
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebarHigh
          displayName={user.display_name}
          activePage="/student/high"
          badges={{ assignments: MOCK_ASSIGNMENTS.filter(a => a.urgent).length, announcements: 1, messages: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#4A2040', marginBottom: '4px' }}>Dashboard</h1>
              <p style={{ fontSize: '12px', color: '#888' }}>Welcome back, {user.display_name}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'white', border: '1px solid #d0c4a0', borderRadius: '8px', padding: '10px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPA</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#4A2040' }}>{gpa}</div>
              </div>
              {isHonorRoll && (
                <div style={{ background: '#fef3c7', border: '1px solid #C47A2C', borderRadius: '8px', padding: '10px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#C47A2C' }}>🏆 Honor Roll</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Courses', value: String(MOCK_COURSES.length), color: '#4A2040' },
              { label: 'Due This Week', value: String(MOCK_ASSIGNMENTS.filter(a => a.urgent).length), color: '#b91c1c' },
              { label: 'Attendance', value: '98%', color: '#1d6a3a' },
              { label: 'Credits Earned', value: '18', color: '#1A3A5C' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Courses table */}
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '13px', color: '#4A2040' }}>My Courses</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f9f6ee' }}>
                    {['Subject', 'Teacher', 'Progress', 'Grade'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 14px', fontSize: '10px', fontWeight: '600', color: '#4A2040', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COURSES.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{c.emoji}</span>
                          <span style={{ fontWeight: '600', fontSize: '11px' }}>{c.subject}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 14px', color: '#777', fontSize: '11px' }}>{c.teacher}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '50px', height: '5px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${c.progress}%`, height: '100%', background: '#4A2040' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#aaa' }}>{c.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 14px', fontWeight: '800', color: gradeColor(c.grade) }}>{c.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Assignments */}
              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '13px', color: '#4A2040' }}>Upcoming Assignments</div>
                <div style={{ padding: '8px' }}>
                  {MOCK_ASSIGNMENTS.map((a, i) => (
                    <div key={i} style={{ padding: '9px 12px', borderRadius: '6px', marginBottom: '4px', background: a.urgent ? '#fef3c7' : '#f9f6ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{a.emoji}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>{a.title}</div>
                          <div style={{ fontSize: '10px', color: '#C47A2C' }}>{a.subject}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: a.urgent ? '#b91c1c' : '#888', flexShrink: 0 }}>Due {a.due}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcements */}
              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '13px', color: '#4A2040' }}>Announcements</div>
                <div style={{ padding: '8px' }}>
                  {MOCK_ANNOUNCEMENTS.map((ann, i) => (
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