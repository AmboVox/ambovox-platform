'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

export default function CourseBuilderPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dayType, setDayType] = useState('home')
  const [contentType, setContentType] = useState('learning')
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/builder" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Course Builder</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '10px', background: '#e8e0d0', color: '#555', fontWeight: '600' }}>Draft</span>
              <button style={{ fontSize: '12px', padding: '6px 14px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Preview</button>
              <button style={{ fontSize: '12px', padding: '6px 14px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Publish</button>
            </div>
          </div>

          <div style={{ background: '#e8f5ee', color: '#1a5c35', borderLeft: '3px solid #2E6B4A', padding: '9px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
            Learning content stays permanently unlocked. Assessments lock after submission — students can always view submitted work once answers are released.
          </div>

          <div style={{ display: 'flex', gap: '14px', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: '230px', minWidth: '230px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#2E6B4A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outline</span>
                <button style={{ fontSize: '11px', border: '1px solid #c8bea0', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', background: 'white' }}>+</button>
              </div>

              <div style={{ border: '1px solid #d0c4a0', borderRadius: '6px', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 10px', background: '#e8f5ee', fontSize: '12px', fontWeight: '700', color: '#2E6B4A' }}>📁 Module 1: Foundations</div>
                <div style={{ padding: '7px 10px 7px 22px', fontSize: '12px', fontWeight: '600', color: '#2E6B4A', borderTop: '1px solid #ede8dc', background: '#f4faf6' }}>Unit 1: Number Systems</div>
                {[
                  ['▶', 'Intro to Real Numbers', 'learning'],
                  ['▶', 'Properties of Operations', 'learning'],
                  ['?', 'Knowledge Check', 'knowledge'],
                  ['🔒', 'Unit Quiz', 'quiz'],
                  ['🛡', 'Unit Test', 'test'],
                ].map(([icon, label, type]) => (
                  <div key={label} style={{ padding: '6px 10px 6px 34px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666', borderTop: '1px solid #ede8dc' }}>
                    <span style={{ fontSize: '11px' }}>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '10px', background: type === 'test' ? '#fceaea' : type === 'quiz' ? '#fef9e7' : type === 'knowledge' ? '#e8f5ee' : '#e8f0fc', color: type === 'test' ? '#7a1020' : type === 'quiz' ? '#7a5c00' : type === 'knowledge' ? '#1a5c35' : '#1a4a8a' }}>{type}</span>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid #d0c4a0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 10px', background: '#f9f6ee', fontSize: '12px', fontWeight: '700', color: '#888' }}>📁 Module 2: Quadratics</div>
                <div style={{ padding: '7px 10px 7px 22px', fontSize: '12px', color: '#aaa', borderTop: '1px solid #ede8dc' }}>Unit 3: Factoring</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Lesson Title</label>
                <input defaultValue="Intro to Real Numbers" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Day Type</label>
                  <select value={dayType} onChange={(e) => setDayType(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option value="home">🏠 Home day — lecture</option>
                    <option value="campus">🏫 Campus day — application</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Content Type</label>
                  <select value={contentType} onChange={(e) => setContentType(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option value="learning">Learning (never locks)</option>
                    <option value="knowledge">Knowledge Check (retakeable)</option>
                    <option value="quiz">Quiz (locks after submit)</option>
                    <option value="test">Test (locks after submit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Lecture Video</label>
                <div style={{ border: '1px solid #d0c4a0', borderRadius: '4px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '9px', background: '#f9f6ee' }}>
                  <span style={{ fontSize: '18px' }}>🎥</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>real-numbers.mp4 · 18:42</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>Uploaded · Permanently unlocked</div>
                  </div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#d4edda', color: '#155724', fontWeight: '600' }}>Ready</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Parent Guide <span style={{ textTransform: 'none', fontWeight: '400', color: '#aaa' }}>(parents only)</span>
                </label>
                <div style={{ fontSize: '11px', color: '#2E6B4A', background: '#e8f5ee', borderRadius: '4px', padding: '7px 10px', marginBottom: '6px', borderLeft: '3px solid #2E6B4A' }}>
                  Reminder: Share the core concept in plain language, flag any tricky areas, and suggest how parents can check their student's understanding.
                </div>
                <textarea defaultValue='Ask your student: "Is √2 bigger or smaller than 1.5?" Common confusion: not all decimals are rational.' style={{ width: '100%', minHeight: '70px', padding: '8px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Character & Virtue Award <span style={{ textTransform: 'none', fontWeight: '400', color: '#aaa' }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select style={{ flex: 1, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option value="">— None —</option>
                    <option>Diligence</option>
                    <option>Integrity</option>
                    <option>Perseverance</option>
                  </select>
                  <input placeholder="Brief commendation..." style={{ flex: 2, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
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