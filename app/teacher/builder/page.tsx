'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const EMOJI_OPTIONS = [
  '📖','📚','✏️','🔢','🔤','✝️','🙏','🌍','🔬','🧪',
  '🎨','🎵','🏛️','🌿','🐾','🎭','🏃','📜','🌱','🎯',
  '🔭','🌈','📐','🗺️','🌊','🦁','🎤','👏','⭐','🏠',
  '🐄','🌎','🎸','⚽','🦋','🍎','✍️','🖊️','🎺','🥁',
  '🌸','🐝','🦅','⛪','🕊️','📿','🗝️','🏺','🌻','🎪',
]

function hexToLightBg(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},0.12)`
  } catch {
    return '#f9f6ee'
  }
}

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) return ''
  const r = parseInt(match[1]).toString(16).padStart(2, '0')
  const g = parseInt(match[2]).toString(16).padStart(2, '0')
  const b = parseInt(match[3]).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

function ColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [textValue, setTextValue] = useState(value)
  const [error, setError] = useState('')

  function handleTextChange(raw: string) {
    setTextValue(raw)
    setError('')
    const hex = raw.startsWith('#') ? raw : '#' + raw
    if (isValidHex(hex)) {
      onChange(hex.toLowerCase())
      return
    }
    if (raw.toLowerCase().startsWith('rgb')) {
      const converted = rgbToHex(raw)
      if (converted) {
        onChange(converted)
        return
      }
    }
    if (raw.length > 2) setError('Enter a hex (e.g. #2E6B4A) or rgb (e.g. rgb(46,107,74))')
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hex = e.target.value
    onChange(hex)
    setTextValue(hex)
    setError('')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          value={isValidHex(value) ? value : '#2e6b4a'}
          onChange={handlePickerChange}
          style={{ width: '40px', height: '36px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', padding: '2px' }}
        />
        <input
          value={textValue}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={() => setTextValue(value)}
          placeholder="#2E6B4A or rgb(46,107,74)"
          style={{ flex: 1, padding: '7px 10px', border: `1px solid ${error ? '#b91c1c' : '#c8bea0'}`, borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
        />
      </div>
      {error && <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: '4px' }}>{error}</div>}
    </div>
  )
}

export default function CourseBuilderPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dayType, setDayType] = useState('home')
  const [contentType, setContentType] = useState('learning')
  const [courseEmoji, setCourseEmoji] = useState('📐')
  const [courseColor, setCourseColor] = useState('#1a5276')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
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

            {/* Left: Outline panel */}
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

            {/* Right: Lesson editor */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '11px' }}>

              {/* ── COURSE APPEARANCE ── */}
              <div style={{ background: 'white', border: '1px solid #d0c4a0', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#2E6B4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Course Appearance
                </div>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
                  The emoji appears on all student portal types. The color is used for Middle and High School student portals. Enter a hex code (e.g. #2E6B4A) or RGB value (e.g. rgb(46,107,74)).
                </p>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                  {/* Emoji picker */}
                  <div style={{ flex: '0 0 auto' }}>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }}>Course Emoji</label>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      style={{ width: '64px', height: '64px', borderRadius: '12px', background: hexToLightBg(courseColor), border: `2px solid ${courseColor}`, fontSize: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {courseEmoji}
                    </button>
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px', textAlign: 'center' }}>Click to change</div>
                  </div>

                  {/* Color picker */}
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }}>
                      Course Color <span style={{ fontWeight: '400', textTransform: 'none', color: '#aaa' }}>(Middle & High School)</span>
                    </label>
                    <ColorInput value={courseColor} onChange={setCourseColor} />
                    {/* Live preview */}
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: hexToLightBg(courseColor), border: `1px solid ${courseColor}30`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '22px' }}>{courseEmoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: courseColor }}>Algebra II Honors</span>
                      <span style={{ fontSize: '10px', color: courseColor, marginLeft: 'auto', opacity: 0.6 }}>Preview</span>
                    </div>
                  </div>
                </div>

                {/* Emoji grid */}
                {showEmojiPicker && (
                  <div style={{ marginTop: '12px', padding: '10px', background: '#f9f6ee', borderRadius: '8px', border: '1px solid #d0c4a0' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Choose Emoji</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
                      {EMOJI_OPTIONS.map(e => (
                        <button
                          key={e}
                          onClick={() => { setCourseEmoji(e); setShowEmojiPicker(false) }}
                          style={{ fontSize: '20px', padding: '6px', border: courseEmoji === e ? '2px solid #C47A2C' : '1px solid transparent', borderRadius: '6px', cursor: 'pointer', background: courseEmoji === e ? '#fdebd0' : 'white' }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── LESSON FIELDS ── */}
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