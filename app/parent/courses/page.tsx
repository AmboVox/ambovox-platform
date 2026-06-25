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

const MOCK_COURSES: Record<string, any[]> = {
  'child-1': [
    {
      id: 'algebra', subject: 'Algebra I', teacher: 'Ms. Elena Hart', progress: 74,
      modules: [
        { id: 'm1', title: 'Module 1: Foundations', lessons: [
          { id: 'l1', title: 'Intro to Real Numbers', type: 'learning', duration: '18:42', parentGuide: 'This lesson covers what makes a number "real" — rational vs. irrational. Ask your student: "Is √2 bigger or smaller than 1.5?" Common confusion: not all decimals are rational. If they can explain why √2 is irrational, they have understood the lesson.' },
          { id: 'l2', title: 'Properties of Operations', type: 'learning', duration: '21:05', parentGuide: 'Students learned the commutative, associative, and distributive properties. Quick check: ask them to explain why 3 × (4 + 5) = 3 × 4 + 3 × 5. If they can walk you through it step by step, they have it.' },
          { id: 'l3', title: 'Knowledge Check', type: 'knowledge', duration: null, parentGuide: null },
          { id: 'l4', title: 'Unit Quiz', type: 'quiz', duration: null, parentGuide: null },
        ]},
        { id: 'm2', title: 'Module 2: Expressions & Equations', lessons: [
          { id: 'l5', title: 'Writing Expressions', type: 'learning', duration: '16:30', parentGuide: 'Students are translating word problems into algebraic expressions. Practice at home: say "three more than a number" and ask them to write it as (n + 3). Try a few more to reinforce the skill.' },
          { id: 'l6', title: 'Solving One-Step Equations', type: 'learning', duration: '23:18', parentGuide: 'The key concept here is "inverse operations" — doing the opposite to both sides to isolate the variable. If your student gets stuck, remind them: whatever you do to one side, you must do to the other.' },
          { id: 'l7', title: 'Unit Test', type: 'test', duration: null, parentGuide: null },
        ]},
      ]
    },
    {
      id: 'latin', subject: 'Latin', teacher: 'Mr. Donaldson', progress: 81,
      modules: [
        { id: 'm1', title: 'Module 1: First Declension', lessons: [
          { id: 'l1', title: 'Latin Alphabet & Pronunciation', type: 'learning', duration: '14:20', parentGuide: 'Latin pronunciation is consistent — each letter has one sound. Ask your student to read a sentence aloud. If they can pronounce each vowel correctly, they are on track.' },
          { id: 'l2', title: 'First Declension Nouns', type: 'learning', duration: '25:10', parentGuide: 'Students are learning noun "cases" — how a word changes based on its role in a sentence. This is the hardest early concept in Latin. Ask: "What case is the subject of a sentence?" (Answer: nominative). Drilling this will help it stick.' },
          { id: 'l3', title: 'Knowledge Check', type: 'knowledge', duration: null, parentGuide: null },
        ]},
      ]
    },
    {
      id: 'history', subject: 'History of Christendom', teacher: 'Mr. Thomas Wells', progress: 90,
      modules: [
        { id: 'm1', title: 'Module 1: The Ancient World', lessons: [
          { id: 'l1', title: 'Creation & the Fall', type: 'learning', duration: '20:00', parentGuide: 'This lesson frames all of history through a biblical lens — creation, fall, redemption, restoration. Ask your student: "How does the Fall help us understand why the world has conflict?" This makes for a wonderful dinner table discussion.' },
          { id: 'l2', title: 'The Patriarchs', type: 'learning', duration: '18:45', parentGuide: "Students studied Abraham, Isaac, Jacob, and Joseph. Key theme: God's faithfulness even when His people fail. Ask your student which patriarch's story stood out most to them and why." },
          { id: 'l3', title: 'Unit Quiz', type: 'quiz', duration: null, parentGuide: null },
        ]},
      ]
    },
  ],
  'child-2': [
    {
      id: 'reading', subject: 'Phonics & Reading', teacher: 'Mrs. Cole', progress: 88,
      modules: [
        { id: 'm1', title: 'Module 1: Blends & Digraphs', lessons: [
          { id: 'l1', title: 'Consonant Blends', type: 'learning', duration: '12:30', parentGuide: 'Students are practicing blends — two consonants where both sounds are heard (like "bl" in "black"). Practice by pointing to words in a book and asking your child to identify the blend at the beginning of the word.' },
          { id: 'l2', title: 'Digraphs: sh, ch, th', type: 'learning', duration: '11:45', parentGuide: 'Digraphs are two letters that make ONE sound. Say a word like "ship" and ask your child: "How many letters make the first sound?" (Answer: 2 — s and h together). This is a very common point of confusion.' },
          { id: 'l3', title: 'Knowledge Check', type: 'knowledge', duration: null, parentGuide: null },
        ]},
      ]
    },
    {
      id: 'arithmetic', subject: 'Arithmetic', teacher: 'Ms. Hart', progress: 79,
      modules: [
        { id: 'm1', title: 'Module 1: Multiplication', lessons: [
          { id: 'l1', title: 'Understanding Multiplication', type: 'learning', duration: '15:20', parentGuide: 'Students are learning multiplication as repeated addition (3 × 4 = 4 + 4 + 4). Use small objects like coins or blocks to group them and count together. Making it physical before abstract helps enormously at this age.' },
          { id: 'l2', title: 'Times Tables 1–5', type: 'learning', duration: '19:00', parentGuide: 'Memorizing times tables takes repetition. Short and frequent is best — 5 minutes a day beats 30 minutes once a week. Try flashcards at breakfast or in the car. Focus on 3s and 4s this week as those tend to be the trickiest.' },
          { id: 'l3', title: 'Unit Quiz', type: 'quiz', duration: null, parentGuide: null },
        ]},
      ]
    },
  ],
}

const VISIBLE_TYPES = ['learning', 'knowledge']

export default function ParentCoursesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [view, setView] = useState<'courses' | 'course' | 'lesson'>('courses')
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
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
  const courses = MOCK_COURSES[activeChildId]

  function handleChildChange(id: string) {
    setActiveChildId(id)
    setView('courses')
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  function openCourse(course: any) {
    setSelectedCourse(course)
    setView('course')
  }

  function openLesson(lesson: any) {
    setSelectedLesson(lesson)
    setView('lesson')
  }

  function backToCourses() {
    setView('courses')
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  function backToLessons() {
    setView('course')
    setSelectedLesson(null)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={handleChildChange}
          activePage="/parent/courses"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
              {MOCK_CHILDREN.map(child => (
                <button key={child.id} onClick={() => handleChildChange(child.id)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: activeChildId === child.id ? '#1A3A5C' : '#888' }}>
                  {child.name}
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: activeChildId === child.id ? '#C47A2C' : '#bbb' }}>Grade {child.grade}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── COURSE LIST ── */}
          {view === 'courses' && (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#1A3A5C' }}>{activeChild.name}'s Lesson Content</h1>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>You can view all lesson content and Parent Guide notes left by teachers. Quizzes and tests are not shown here.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {courses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#1A3A5C', marginBottom: '4px' }}>{course.subject}</div>
                    <div style={{ fontSize: '11px', color: '#C47A2C', marginBottom: '14px' }}>{course.teacher}</div>
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginBottom: '4px' }}>
                        <span>Progress</span><span>{course.progress}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: '#1A3A5C', borderRadius: '3px' }} />
                      </div>
                    </div>
                    <button onClick={() => openCourse(course)} style={{ width: '100%', padding: '7px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      View Lessons
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── LESSON LIST ── */}
          {view === 'course' && selectedCourse && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={backToCourses} style={{ padding: '6px 14px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#555' }}>← Back</button>
                <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>{selectedCourse.subject}</h1>
                <span style={{ fontSize: '12px', color: '#888' }}>{selectedCourse.teacher}</span>
              </div>

              {selectedCourse.modules.map((mod: any) => (
                <div key={mod.id} style={{ marginBottom: '24px' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', padding: '8px 12px', background: '#fdebd0', borderRadius: '6px' }}>
                    {mod.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {mod.lessons.map((lesson: any) => {
                      const isVisible = VISIBLE_TYPES.includes(lesson.type)
                      if (!isVisible) return (
                        <div key={lesson.id} style={{ padding: '12px 16px', background: '#f5f3ee', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px' }}>🔒</span>
                            <span style={{ fontSize: '12px', color: '#888' }}>{lesson.title}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#aaa', fontStyle: 'italic' }}>Assessment — not shown to parents</span>
                        </div>
                      )
                      return (
                        <div key={lesson.id} className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px' }}>{lesson.type === 'learning' ? '▶' : '📝'}</span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{lesson.title}</div>
                              {lesson.duration && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '1px' }}>{lesson.duration}</div>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {lesson.parentGuide && (
                              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: '#d1fae5', color: '#1d6a3a' }}>Parent Guide ✓</span>
                            )}
                            <button onClick={() => openLesson(lesson)} style={{ padding: '5px 14px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>View</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── LESSON DETAIL ── */}
          {view === 'lesson' && selectedLesson && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button onClick={backToLessons} style={{ padding: '6px 14px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px', color: '#555' }}>← Back to Lessons</button>
                <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>{selectedLesson.title}</h1>
              </div>

              {selectedLesson.type === 'learning' && (
                <div className="bg-white rounded-lg border mb-5" style={{ borderColor: '#d0c4a0', overflow: 'hidden' }}>
                  <div style={{ background: '#1a1a2e', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', cursor: 'pointer' }}>▶</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{selectedLesson.title} · {selectedLesson.duration}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Video will load here when connected to Supabase storage</div>
                  </div>
                </div>
              )}

              {selectedLesson.parentGuide && (
                <div className="bg-white rounded-lg border p-5 mb-5" style={{ borderColor: '#d0c4a0', borderLeft: '4px solid #1d6a3a' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1d6a3a', marginBottom: '10px' }}>
                    ✝ Parent Guide
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: '1.9', color: '#333' }}>{selectedLesson.parentGuide}</p>
                </div>
              )}

              {selectedLesson.type === 'knowledge' && (
                <div className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A3A5C', marginBottom: '8px' }}>Knowledge Check</div>
                  <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>Knowledge check questions will appear here when connected to course data.</p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}