'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const SUBJECTS = [
  { id: 'reading', label: 'Reading & Language Arts', emoji: '📖', color: '#c0392b', bg: '#fde8e8', progress: 68 },
  { id: 'arithmetic', label: 'Arithmetic', emoji: '🔢', color: '#1a5276', bg: '#d6eaf8', progress: 74 },
  { id: 'scripture', label: 'Scripture', emoji: '✝️', color: '#6c3483', bg: '#e8daef', progress: 90 },
  { id: 'handwriting', label: 'Handwriting', emoji: '✏️', color: '#b7770d', bg: '#fef9e7', progress: 85 },
  { id: 'history', label: 'History & Geography', emoji: '🌍', color: '#1e8449', bg: '#d5f5e3', progress: 60 },
  { id: 'science', label: 'Science', emoji: '🔬', color: '#117a65', bg: '#d1f2eb', progress: 55 },
  { id: 'art', label: 'Art', emoji: '🎨', color: '#922b21', bg: '#fce4ec', progress: 72 },
  { id: 'music', label: 'Music', emoji: '🎵', color: '#1a5276', bg: '#dbeafe', progress: 80 },
]

const LESSONS: Record<string, any[]> = {
  reading: [
    { id: 'l1', title: 'Consonant Blends', emoji: '🔤', duration: '12:30', done: true },
    { id: 'l2', title: 'Digraphs: sh, ch, th', emoji: '🗣️', duration: '11:45', done: true },
    { id: 'l3', title: 'Long Vowel Patterns', emoji: '📢', duration: '14:00', done: false },
    { id: 'l4', title: 'Reading Comprehension', emoji: '📚', duration: '16:30', done: false },
  ],
  arithmetic: [
    { id: 'l1', title: 'Understanding Multiplication', emoji: '✖️', duration: '15:20', done: true },
    { id: 'l2', title: 'Times Tables 1–5', emoji: '📊', duration: '19:00', done: true },
    { id: 'l3', title: 'Times Tables 6–10', emoji: '🔢', duration: '18:30', done: false },
    { id: 'l4', title: 'Division Basics', emoji: '➗', duration: '17:00', done: false },
  ],
  scripture: [
    { id: 'l1', title: 'The Ten Commandments', emoji: '📜', duration: '14:00', done: true },
    { id: 'l2', title: 'The Sermon on the Mount', emoji: '⛰️', duration: '16:00', done: true },
    { id: 'l3', title: "The Lord's Prayer", emoji: '🙏', duration: '12:00', done: true },
  ],
  handwriting: [
    { id: 'l1', title: 'Cursive Letters A–G', emoji: '✏️', duration: '10:00', done: true },
    { id: 'l2', title: 'Cursive Letters H–N', emoji: '📝', duration: '10:00', done: true },
    { id: 'l3', title: 'Cursive Letters O–Z', emoji: '🖊️', duration: '10:00', done: false },
  ],
  history: [
    { id: 'l1', title: 'Ancient Civilizations', emoji: '🏛️', duration: '18:00', done: true },
    { id: 'l2', title: 'Egypt & the Exodus', emoji: '🏜️', duration: '20:00', done: false },
  ],
  science: [
    { id: 'l1', title: 'Plants and How They Grow', emoji: '🌱', duration: '14:00', done: true },
    { id: 'l2', title: 'Animals and Their Habitats', emoji: '🦁', duration: '16:00', done: false },
  ],
  art: [
    { id: 'l1', title: 'Color Theory Basics', emoji: '🎨', duration: '13:00', done: true },
    { id: 'l2', title: 'Drawing from Nature', emoji: '🌿', duration: '15:00', done: false },
  ],
  music: [
    { id: 'l1', title: 'Reading Simple Notes', emoji: '🎵', duration: '12:00', done: true },
    { id: 'l2', title: 'Rhythm and Beat', emoji: '🥁', duration: '11:00', done: false },
  ],
}

const ASSIGNMENTS = [
  { subject: 'Reading', title: 'Reading Log — Week 36', due: 'Jun 25', emoji: '📖' },
  { subject: 'Arithmetic', title: 'Multiplication Practice Sheet', due: 'Jun 24', emoji: '🔢' },
  { subject: 'Scripture', title: 'Psalm 23 Recitation', due: 'Jun 26', emoji: '✝️' },
]

export default function Tier35StudentPortal() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'home' | 'subject' | 'lesson'>('home')
  const [tab, setTab] = useState<'courses' | 'assignments'>('courses')
  const [activeSubject, setActiveSubject] = useState<any>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p style={{ fontWeight: '700', color: '#5B2C83', fontSize: '16px' }}>Loading...</p>
    </div>
  )

  const firstName = user.display_name?.split(' ')[0] || 'Friend'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />

      {/* Top bar */}
      <div style={{ background: '#5B2C83', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>Rex Christus Academy</div>
        <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '17px' }}>
          {view === 'home' ? `Welcome back, ${firstName}! 👋` : view === 'subject' ? activeSubject?.label : activeLesson?.title}
        </div>
        <button onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Sign out</button>
      </div>

      {/* Tab bar — only show on home view */}
      {view === 'home' && (
        <div style={{ background: 'white', borderBottom: '2px solid #d0c4a0', display: 'flex', padding: '0 28px' }}>
          <button onClick={() => setTab('courses')} style={{ padding: '10px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', borderBottom: tab === 'courses' ? '2px solid #5B2C83' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === 'courses' ? '#5B2C83' : '#888' }}>
            📚 My Courses
          </button>
          <button onClick={() => setTab('assignments')} style={{ padding: '10px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: 'none', borderBottom: tab === 'assignments' ? '2px solid #5B2C83' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === 'assignments' ? '#5B2C83' : '#888', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Assignments
            <span style={{ background: '#b91c1c', color: 'white', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '10px' }}>{ASSIGNMENTS.length}</span>
          </button>
        </div>
      )}

      <div style={{ flex: 1, padding: '28px 32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* HOME: Course grid */}
        {view === 'home' && tab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {SUBJECTS.map(subject => {
              const lessons = LESSONS[subject.id] || []
              const done = lessons.filter(l => l.done).length
              return (
                <button
                  key={subject.id}
                  onClick={() => { setActiveSubject(subject); setView('subject') }}
                  style={{ background: 'white', border: `2px solid ${subject.color}30`, borderRadius: '16px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '12px' }}>
                    {subject.emoji}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: subject.color, marginBottom: '4px', lineHeight: '1.3' }}>{subject.label}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px' }}>{done}/{lessons.length} lessons done</div>
                  <div style={{ height: '6px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${subject.progress}%`, height: '100%', background: subject.color, borderRadius: '3px' }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* HOME: Assignments tab */}
        {view === 'home' && tab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>Things To Do 📋</div>
            {ASSIGNMENTS.map((a, i) => (
              <div key={i} style={{ background: 'white', border: '2px solid #e8e0d0', borderRadius: '14px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{a.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#333' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: '#C47A2C', marginTop: '3px' }}>{a.subject}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#b91c1c' }}>Due {a.due}</div>
              </div>
            ))}
          </div>
        )}

        {/* SUBJECT VIEW: Lesson list */}
        {view === 'subject' && activeSubject && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '26px' }}>
              <button onClick={() => { setView('home'); setActiveSubject(null) }} style={{ padding: '8px 18px', borderRadius: '8px', background: '#5B2C83', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>← Back</button>
              <div style={{ fontSize: '28px' }}>{activeSubject.emoji}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: activeSubject.color }}>{activeSubject.label}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(LESSONS[activeSubject.id] || []).map((lesson, i) => (
                <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setView('lesson') }} style={{ background: 'white', border: `2px solid ${lesson.done ? activeSubject.color : '#e0d8c8'}`, borderRadius: '14px', padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '18px', textAlign: 'left', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: lesson.done ? activeSubject.bg : '#f5f3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{lesson.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>Lesson {i + 1}: {lesson.title}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{lesson.duration}</div>
                  </div>
                  {lesson.done && <span style={{ fontSize: '13px', color: '#1d6a3a', fontWeight: '700', background: '#d1fae5', padding: '4px 12px', borderRadius: '10px' }}>✓ Done</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* LESSON VIEW: Video player */}
        {view === 'lesson' && activeLesson && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '26px' }}>
              <button onClick={() => { setView('subject'); setActiveLesson(null) }} style={{ padding: '8px 18px', borderRadius: '8px', background: '#5B2C83', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>← Back</button>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#333' }}>{activeLesson.title}</div>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: '18px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', cursor: 'pointer', border: '3px solid rgba(255,255,255,0.3)' }}>▶</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{activeLesson.duration}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setView('subject')} style={{ padding: '16px 56px', background: '#5B2C83', color: 'white', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: '800', cursor: 'pointer' }}>
                ✅ Mark as Done
              </button>
            </div>
          </>
        )}

      </div>
      <StainedGlassBar />
    </div>
  )
}