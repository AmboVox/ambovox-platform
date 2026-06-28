'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const EMOJI_OPTIONS = [
  '📖','📚','✏️','🔢','🔤','✝️','🙏','🌍','🔬','🧪',
  '🎨','🎵','🏛️','🌿','🐾','🎭','🏃','📜','🌱','🎯',
  '🔭','🌈','📐','🗺️','🌊','🦁','🎤','👏','⭐','🏠',
  '🐄','🌎','🎸','⚽','🦋','🍎','✍️','🖊️','🎺','🥁',
  '🌸','🐝','🦅','⛪','🕊️','📿','🗝️','🏺','🌻','🎪',
]

// Converts a hex color to a very light background version
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

// Validates that a string is a proper hex color
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)
}

// Converts rgb(r,g,b) string to hex
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (!match) return ''
  const r = parseInt(match[1]).toString(16).padStart(2, '0')
  const g = parseInt(match[2]).toString(16).padStart(2, '0')
  const b = parseInt(match[3]).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

interface Subject {
  id: string
  label: string
  emoji: string
  color: string
}

const DEFAULT_K2: Subject[] = [
  { id: '1', label: 'Reading', emoji: '📖', color: '#c0392b' },
  { id: '2', label: 'Math', emoji: '🔢', color: '#1a5276' },
  { id: '3', label: 'Bible', emoji: '✝️', color: '#6c3483' },
  { id: '4', label: 'Writing', emoji: '✏️', color: '#b7770d' },
  { id: '5', label: 'History', emoji: '🌍', color: '#1e8449' },
  { id: '6', label: 'Art', emoji: '🎨', color: '#922b21' },
  { id: '7', label: 'Music', emoji: '🎵', color: '#117a65' },
  { id: '8', label: 'Nature', emoji: '🌿', color: '#1A3A5C' },
]

const DEFAULT_35: Subject[] = [
  { id: '1', label: 'Reading & Language Arts', emoji: '📖', color: '#c0392b' },
  { id: '2', label: 'Arithmetic', emoji: '🔢', color: '#1a5276' },
  { id: '3', label: 'Scripture', emoji: '✝️', color: '#6c3483' },
  { id: '4', label: 'Handwriting', emoji: '✏️', color: '#b7770d' },
  { id: '5', label: 'History & Geography', emoji: '🌍', color: '#1e8449' },
  { id: '6', label: 'Science', emoji: '🔬', color: '#117a65' },
  { id: '7', label: 'Art', emoji: '🎨', color: '#922b21' },
  { id: '8', label: 'Music', emoji: '🎵', color: '#1a5276' },
]

function ColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [textValue, setTextValue] = useState(value)
  const [error, setError] = useState('')

  function handleTextChange(raw: string) {
    setTextValue(raw)
    setError('')
    // Try hex
    const hex = raw.startsWith('#') ? raw : '#' + raw
    if (isValidHex(hex)) {
      onChange(hex.toLowerCase())
      return
    }
    // Try rgb(...)
    if (raw.toLowerCase().startsWith('rgb')) {
      const converted = rgbToHex(raw)
      if (converted) {
        onChange(converted)
        return
      }
    }
    if (raw.length > 2) setError('Enter a hex (e.g. #5B2C83) or rgb (e.g. rgb(91,44,131))')
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
        {/* Native color picker */}
        <input
          type="color"
          value={isValidHex(value) ? value : '#c0392b'}
          onChange={handlePickerChange}
          style={{ width: '40px', height: '36px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', padding: '2px' }}
        />
        {/* Text input for hex or rgb */}
        <input
          value={textValue}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={() => setTextValue(value)}
          placeholder="#5B2C83 or rgb(91,44,131)"
          style={{ flex: 1, padding: '7px 10px', border: `1px solid ${error ? '#b91c1c' : '#c8bea0'}`, borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
        />
      </div>
      {error && <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: '4px' }}>{error}</div>}
    </div>
  )
}

export default function AdminCourseBuilderPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'k2' | '35'>('k2')
  const [k2Subjects, setK2Subjects] = useState<Subject[]>(DEFAULT_K2)
  const [subjects35, setSubjects35] = useState<Subject[]>(DEFAULT_35)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editColor, setEditColor] = useState('#c0392b')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('📖')
  const [newColor, setNewColor] = useState('#c0392b')
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false)
  const [saved, setSaved] = useState(false)
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const subjects = tab === 'k2' ? k2Subjects : subjects35
  const setSubjects = tab === 'k2' ? setK2Subjects : setSubjects35

  function startEdit(subject: Subject) {
    setEditingId(subject.id)
    setEditLabel(subject.label)
    setEditEmoji(subject.emoji)
    setEditColor(subject.color)
    setShowEmojiPicker(false)
  }

  function saveEdit() {
    setSubjects(prev => prev.map(s => s.id === editingId
      ? { ...s, label: editLabel, emoji: editEmoji, color: editColor }
      : s
    ))
    setEditingId(null)
    setShowEmojiPicker(false)
  }

  function deleteSubject(id: string) {
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  function addSubject() {
    if (!newLabel.trim()) return
    const newSubject: Subject = {
      id: Date.now().toString(),
      label: newLabel,
      emoji: newEmoji,
      color: newColor,
    }
    setSubjects(prev => [...prev, newSubject])
    setNewLabel('')
    setNewEmoji('📖')
    setNewColor('#c0392b')
    setShowAddForm(false)
    setShowNewEmojiPicker(false)
  }

  function saveAll() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          displayName={user.display_name}
          activePage="/admin/course-builder"
          badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Course Builder — Elementary Subjects</h1>
            <button onClick={saveAll} style={{ padding: '8px 22px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {saved ? 'Saved! ✓' : 'Save All Changes'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            Manage the subjects shown on the K–2 and Grades 3–5 student portals. Colors can be set using a hex code (e.g. #5B2C83) or an RGB value (e.g. rgb(91,44,131)).
          </p>

          {/* Tab bar */}
          <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
            {[['k2', 'K–2 Subjects'], ['35', 'Grades 3–5 Subjects']].map(([key, label]) => (
              <button key={key} onClick={() => { setTab(key as any); setEditingId(null); setShowAddForm(false) }} style={{ padding: '8px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: tab === key ? '2px solid #C47A2C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === key ? '#C47A2C' : '#888' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Subject grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {subjects.map(subject => (
              <div key={subject.id} className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0', overflow: 'hidden' }}>

                {editingId === subject.id ? (
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#5B2C83', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editing Subject</div>

                    {/* Emoji */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>Emoji</label>
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ width: '100%', padding: '8px', border: '1px solid #c8bea0', borderRadius: '4px', background: '#f9f6ee', fontSize: '22px', cursor: 'pointer' }}>
                        {editEmoji}
                      </button>
                      {showEmojiPicker && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', marginTop: '6px', padding: '8px', background: 'white', border: '1px solid #d0c4a0', borderRadius: '6px' }}>
                          {EMOJI_OPTIONS.map(e => (
                            <button key={e} onClick={() => { setEditEmoji(e); setShowEmojiPicker(false) }} style={{ fontSize: '18px', padding: '4px', border: editEmoji === e ? '2px solid #C47A2C' : '1px solid transparent', borderRadius: '4px', cursor: 'pointer', background: editEmoji === e ? '#fdebd0' : 'transparent' }}>
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>Subject Name</label>
                      <input value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                    </div>

                    {/* Color */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }}>Color</label>
                      <ColorInput value={editColor} onChange={setEditColor} />
                      {/* Preview */}
                      <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', background: hexToLightBg(editColor), display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{editEmoji}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: editColor }}>{editLabel || 'Subject Name'}</span>
                        <span style={{ fontSize: '10px', color: editColor, marginLeft: 'auto', opacity: 0.6 }}>Preview</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={saveEdit} style={{ flex: 1, padding: '7px', background: '#5B2C83', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => { setEditingId(null); setShowEmojiPicker(false) }} style={{ flex: 1, padding: '7px', background: 'white', color: '#555', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: hexToLightBg(subject.color) }}>
                      <div style={{ fontSize: '42px' }}>{subject.emoji}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: subject.color, textAlign: 'center', lineHeight: '1.3' }}>{subject.label}</div>
                      <div style={{ fontSize: '10px', color: subject.color, opacity: 0.6, fontFamily: 'monospace' }}>{subject.color}</div>
                    </div>
                    <div style={{ padding: '8px 10px', display: 'flex', gap: '6px', borderTop: '1px solid #e8e0d0' }}>
                      <button onClick={() => startEdit(subject)} style={{ flex: 1, padding: '5px', fontSize: '11px', background: 'white', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', color: '#5B2C83', fontWeight: '600' }}>✏️ Edit</button>
                      <button onClick={() => deleteSubject(subject.id)} style={{ padding: '5px 10px', fontSize: '11px', background: 'white', border: '1px solid #e8a0a0', borderRadius: '4px', cursor: 'pointer', color: '#b91c1c' }}>✕</button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add subject card */}
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} style={{ border: '2px dashed #d0c4a0', borderRadius: '8px', padding: '20px', cursor: 'pointer', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '140px' }}>
                <div style={{ fontSize: '28px', color: '#d0c4a0' }}>+</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#aaa' }}>Add Subject</div>
              </button>
            )}
          </div>

          {/* Add subject form */}
          {showAddForm && (
            <div className="bg-white rounded-lg border p-5" style={{ borderColor: '#d0c4a0', maxWidth: '480px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#5B2C83', marginBottom: '14px' }}>Add New Subject</div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>Emoji</label>
                <button onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)} style={{ width: '100%', padding: '8px', border: '1px solid #c8bea0', borderRadius: '4px', background: '#f9f6ee', fontSize: '22px', cursor: 'pointer' }}>
                  {newEmoji}
                </button>
                {showNewEmojiPicker && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', marginTop: '6px', padding: '8px', background: 'white', border: '1px solid #d0c4a0', borderRadius: '6px' }}>
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => { setNewEmoji(e); setShowNewEmojiPicker(false) }} style={{ fontSize: '18px', padding: '4px', border: newEmoji === e ? '2px solid #C47A2C' : '1px solid transparent', borderRadius: '4px', cursor: 'pointer', background: newEmoji === e ? '#fdebd0' : 'transparent' }}>
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>Subject Name</label>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. Physical Education" style={{ width: '100%', padding: '8px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '13px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }}>Color</label>
                <ColorInput value={newColor} onChange={setNewColor} />
                {/* Preview */}
                <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '6px', background: hexToLightBg(newColor), display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{newEmoji}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: newColor }}>{newLabel || 'Subject Name'}</span>
                  <span style={{ fontSize: '10px', color: newColor, marginLeft: 'auto', opacity: 0.6 }}>Preview</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addSubject} disabled={!newLabel.trim()} style={{ flex: 1, padding: '9px', background: newLabel.trim() ? '#5B2C83' : '#c8bea0', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: newLabel.trim() ? 'pointer' : 'not-allowed' }}>
                  Add Subject
                </button>
                <button onClick={() => { setShowAddForm(false); setShowNewEmojiPicker(false) }} style={{ flex: 1, padding: '9px', background: 'white', color: '#555', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}