'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StudentSidebarMiddle from '@/components/layout/StudentSidebarMiddle'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_COURSES = [
  { subject: 'Classical Literature', teacher: 'Mrs. Alcott', progress: 78, grade: 'A-', emoji: '📖', nextLesson: 'The Odyssey — Book 9' },
  { subject: 'Pre-Algebra', teacher: 'Ms. Hart', progress: 65, grade: 'B+', emoji: '🔢', nextLesson: 'Solving Two-Step Equations' },
  { subject: 'History of Christendom', teacher: 'Mr. Wells', progress: 82, grade: 'A', emoji: '🌍', nextLesson: 'The Early Church Fathers' },
  { subject: 'Latin I', teacher: 'Mr. Donaldson', progress: 70, grade: 'A-', emoji: '📜', nextLesson: 'Second Declension Nouns' },
]

const MOCK_ASSIGNMENTS = [
  { subject: 'Pre-Algebra', title: 'Chapter 8 Problem Set', due: 'Jun 25', emoji: '🔢', urgent: true },
  { subject: 'Classical Literature', title: 'Reading — Odyssey Books 9–12', due: 'Jun 27', emoji: '📖', urgent: false },
  { subject: 'Latin I', title: 'Declension Practice Worksheet', due: 'Jun 26', emoji: '📜', urgent: false },
]

const MOCK_GRADES = [
  { subject: 'Classical Literature', grade: 'A-', score: '91%' },
  { subject: 'Pre-Algebra', grade: 'B+', score: '88%' },
  { subject: 'History of Christendom', grade: 'A', score: '94%' },
  { subject: 'Latin I', grade: 'A-', score: '90%' },
]

export default function MiddleStudentPortal() {
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

  const firstName = user.display_name?.split(' ')[0] || 'Student'

  function gradeColor(g: string) {
    if (g.startsWith('A')) return '#1d6a3a'
    if (g.startsWith('B')) return '#1A3A5C'
    return '#b45309'
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <StudentSidebarMiddle
          displayName={user.display_name}
          activePage="/student/middle"
          badges={{ assignments: MOCK_ASSIGNMENTS.length, announcements: 1, messages: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#3D5A80' }}>Good morning, {firstName}! 👋</h1>
            <div style={{ background: 'white', border: '1px solid #d0c4a0', borderRadius: '8px', padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPA</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#3D5A80' }}>3.72</div>
            </div>
          </div>

          {MOCK_ASSIGNMENTS.filter(a => a.urgent).length > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #b45309', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#b45309' }}>You have assignments due soon — check your assignments!</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* My Courses */}
            <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '14px', color: '#3D5A80' }}>📚 My Courses</div>
              <div style={{ padding: '8px' }}>
                {MOCK_COURSES.map((c, i) => (
                  <div key={i} style={{ padding: '12px', borderRadius: '8px', marginBottom: '6px', background: '#f9f6ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '22px' }}>{c.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{c.subject}</div>
                        <div style={{ fontSize: '10px', color: '#C47A2C' }}>{c.teacher}</div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: gradeColor(c.grade) }}>{c.grade}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Next: {c.nextLesson}</div>
                    <div style={{ height: '5px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.progress}%`, height: '100%', background: '#3D5A80', borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Assignments */}
              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '14px', color: '#3D5A80' }}>📋 Assignments Due</div>
                <div style={{ padding: '8px' }}>
                  {MOCK_ASSIGNMENTS.map((a, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '4px', background: a.urgent ? '#fef3c7' : '#f9f6ee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{a.emoji}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>{a.title}</div>
                          <div style={{ fontSize: '10px', color: '#888' }}>{a.subject}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: a.urgent ? '#b91c1c' : '#888', flexShrink: 0 }}>Due {a.due}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grades */}
              <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e0d0', fontWeight: '700', fontSize: '14px', color: '#3D5A80' }}>📊 Current Grades</div>
                <div style={{ padding: '4px' }}>
                  {MOCK_GRADES.map((g, i) => (
                    <div key={i} style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < MOCK_GRADES.length - 1 ? '1px solid #ede8dc' : 'none' }}>
                      <span style={{ fontSize: '12px', color: '#555' }}>{g.subject}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>{g.score}</span>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: gradeColor(g.grade), minWidth: '28px', textAlign: 'right' }}>{g.grade}</span>
                      </div>
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