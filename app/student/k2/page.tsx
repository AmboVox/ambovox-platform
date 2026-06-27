'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const SUBJECTS = [
  { id: 'reading', label: 'Reading', emoji: '📖', color: '#c0392b', bg: '#fde8e8' },
  { id: 'math', label: 'Math', emoji: '🔢', color: '#1a5276', bg: '#d6eaf8' },
  { id: 'bible', label: 'Bible', emoji: '✝️', color: '#6c3483', bg: '#e8daef' },
  { id: 'writing', label: 'Writing', emoji: '✏️', color: '#b7770d', bg: '#fef9e7' },
  { id: 'history', label: 'History', emoji: '🌍', color: '#1e8449', bg: '#d5f5e3' },
  { id: 'art', label: 'Art', emoji: '🎨', color: '#922b21', bg: '#fce4ec' },
  { id: 'music', label: 'Music', emoji: '🎵', color: '#117a65', bg: '#d1f2eb' },
  { id: 'nature', label: 'Nature', emoji: '🌿', color: '#196f3d', bg: '#eafaf1' },
]

const LESSONS: Record<string, any[]> = {
  reading: [
    { id: 'l1', title: 'The ABCs', emoji: '🔤', duration: '10:00', stars: 3 },
    { id: 'l2', title: 'Short Vowels', emoji: '🔊', duration: '12:30', stars: 3 },
    { id: 'l3', title: 'Consonant Sounds', emoji: '🗣️', duration: '11:00', stars: 0 },
    { id: 'l4', title: 'Simple Words', emoji: '📝', duration: '13:45', stars: 0 },
  ],
  math: [
    { id: 'l1', title: 'Counting to 10', emoji: '🔢', duration: '8:30', stars: 3 },
    { id: 'l2', title: 'Adding Numbers', emoji: '➕', duration: '11:00', stars: 2 },
    { id: 'l3', title: 'Taking Away', emoji: '➖', duration: '10:30', stars: 0 },
    { id: 'l4', title: 'Shapes & Colors', emoji: '🔷', duration: '9:00', stars: 0 },
  ],
  bible: [
    { id: 'l1', title: 'God Made the World', emoji: '🌎', duration: '9:00', stars: 3 },
    { id: 'l2', title: 'Noah and the Ark', emoji: '🚢', duration: '12:00', stars: 3 },
    { id: 'l3', title: 'The Good Shepherd', emoji: '🐑', duration: '10:00', stars: 0 },
  ],
  writing: [
    { id: 'l1', title: 'Holding a Pencil', emoji: '✏️', duration: '7:00', stars: 3 },
    { id: 'l2', title: 'Drawing Lines', emoji: '📏', duration: '8:30', stars: 2 },
    { id: 'l3', title: 'My First Letters', emoji: '🔡', duration: '11:00', stars: 0 },
  ],
  history: [
    { id: 'l1', title: 'Our Family', emoji: '👨‍👩‍👧‍👦', duration: '8:00', stars: 3 },
    { id: 'l2', title: 'Our Community', emoji: '🏘️', duration: '9:30', stars: 0 },
  ],
  art: [
    { id: 'l1', title: 'Colors All Around', emoji: '🌈', duration: '10:00', stars: 3 },
    { id: 'l2', title: 'Drawing Animals', emoji: '🐾', duration: '12:00', stars: 0 },
  ],
  music: [
    { id: 'l1', title: 'Clapping Rhythms', emoji: '👏', duration: '8:00', stars: 3 },
    { id: 'l2', title: 'Singing Together', emoji: '🎤', duration: '10:00', stars: 0 },
  ],
  nature: [
    { id: 'l1', title: 'Plants and Seeds', emoji: '🌱', duration: '9:00', stars: 3 },
    { id: 'l2', title: 'Animals of the Farm', emoji: '🐄', duration: '11:00', stars: 0 },
  ],
}

export default function K2StudentPortal() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'home' | 'subject' | 'lesson'>('home')
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8E7' }}>
      <div style={{ fontSize: '48px' }}>⭐</div>
    </div>
  )

  const firstName = user.display_name?.split(' ')[0] || 'Friend'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FFF8E7' }}>
      <StainedGlassBar />

      {/* Top bar */}
      <div style={{ background: '#5B2C83', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontWeight: '800', fontSize: '16px' }}>Rex Christus Academy</div>
        <div style={{ color: '#FFD700', fontWeight: '800', fontSize: '20px' }}>
          {view === 'home' ? `Hello, ${firstName}! 👋` : view === 'subject' ? activeSubject?.label : activeLesson?.title}
        </div>
        <button onClick={handleSignOut} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
          Sign out
        </button>
      </div>

      <div style={{ flex: 1, padding: '36px', maxWidth: '920px', margin: '0 auto', width: '100%' }}>

        {/* HOME: Subject icon grid */}
        {view === 'home' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '30px', fontWeight: '800', color: '#5B2C83' }}>
                What do you want to learn today?
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '22px' }}>
              {SUBJECTS.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => { setActiveSubject(subject); setView('subject') }}
                  style={{ background: 'white', border: `3px solid ${subject.color}`, borderRadius: '24px', padding: '32px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                    {subject.emoji}
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: subject.color }}>{subject.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* SUBJECT VIEW: Lesson list */}
        {view === 'subject' && activeSubject && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '32px' }}>
              <button
                onClick={() => { setView('home'); setActiveSubject(null) }}
                style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#5B2C83', color: 'white', border: 'none', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ←
              </button>
              <div style={{ fontSize: '36px' }}>{activeSubject.emoji}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: activeSubject.color }}>{activeSubject.label}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(LESSONS[activeSubject.id] || []).map((lesson, i) => (
                <button
                  key={lesson.id}
                  onClick={() => { setActiveLesson(lesson); setView('lesson') }}
                  style={{ background: 'white', border: `2px solid ${lesson.stars > 0 ? activeSubject.color : '#e0d8c8'}`, borderRadius: '20px', padding: '22px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'left' }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: lesson.stars > 0 ? activeSubject.bg : '#f5f3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
                    {lesson.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                      Lesson {i + 1}: {lesson.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#aaa' }}>{lesson.duration}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map(star => (
                      <span key={star} style={{ fontSize: '26px', color: star <= lesson.stars ? '#FFD700' : '#e0d8c8' }}>★</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* LESSON VIEW: Video player */}
        {view === 'lesson' && activeLesson && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '32px' }}>
              <button
                onClick={() => { setView('subject'); setActiveLesson(null) }}
                style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#5B2C83', color: 'white', border: 'none', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ←
              </button>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#333' }}>{activeLesson.title}</div>
            </div>

            <div style={{ background: '#1a1a2e', borderRadius: '24px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '18px', marginBottom: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', cursor: 'pointer', border: '3px solid rgba(255,255,255,0.35)' }}>
                ▶
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{activeLesson.duration}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setView('subject')}
                style={{ padding: '20px 70px', background: '#5B2C83', color: 'white', border: 'none', borderRadius: '60px', fontSize: '22px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(91,44,131,0.4)' }}
              >
                ✅ All Done!
              </button>
            </div>
          </>
        )}

      </div>
      <StainedGlassBar />
    </div>
  )
}