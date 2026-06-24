'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const GRADE_SLOTS = [
  { key: 0, label: 'Kindergarten' },
  { key: 1, label: 'Grade 1' },
  { key: 2, label: 'Grade 2' },
  { key: 3, label: 'Grade 3' },
  { key: 4, label: 'Grade 4' },
  { key: 5, label: 'Grade 5' },
  { key: 6, label: 'Grade 6' },
  { key: 7, label: 'Grade 7' },
  { key: 8, label: 'Grade 8' },
  { key: 9, label: 'Grade 9' },
  { key: 10, label: 'Grade 10' },
  { key: 11, label: 'Grade 11' },
  { key: 12, label: 'Grade 12' },
  { key: 99, label: 'Admin' },
]

const FONT_SIZES = ['Small', 'Medium', 'Large', 'XL', 'Biggest']

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const DAY_TYPES = [
  { key: 'school', label: 'School Day', color: '#5B2C83', bg: '#ede8f5' },
  { key: 'holiday', label: 'Holiday / No School', color: '#b91c1c', bg: '#fee2e2' },
  { key: 'half', label: 'Half Day', color: '#b45309', bg: '#fef3c7' },
  { key: 'event', label: 'Special Event', color: '#1d6a3a', bg: '#d1fae5' },
  { key: 'pd', label: 'Prof. Development (No Students)', color: '#1e40af', bg: '#dbeafe' },
]

type DayEntry = { type: string; label: string }
type CalendarData = Record<string, DayEntry>

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'branding'|'grading'|'accounts'|'calendar'>('branding')

  // Branding
  const [schoolName, setSchoolName] = useState('Rex Christus Academy')
  const [motto, setMotto] = useState('No King But Christ')
  const [primaryColor, setPrimaryColor] = useState('#5B2C83')
  const [accentColor, setAccentColor] = useState('#C47A2C')
  const [fontSize, setFontSize] = useState('Medium')
  const [gradeLogos, setGradeLogos] = useState<Record<number,string>>({})

  // Grading
  const [minGPA, setMinGPA] = useState('2.0')
  const [cutoffLetter, setCutoffLetter] = useState('F')
  const [useCustomScale, setUseCustomScale] = useState(false)

  // Calendar
  const currentYear = new Date().getFullYear()
  const [schoolYearStart, setSchoolYearStart] = useState(currentYear)
  const [viewYear, setViewYear] = useState(currentYear)
  const [viewMonth, setViewMonth] = useState(7) // August = index 7
  const [calendarData, setCalendarData] = useState<CalendarData>({})
  const [selectedTool, setSelectedTool] = useState('school')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [editingDay, setEditingDay] = useState<string|null>(null)
  const [termRanges, setTermRanges] = useState([
    { name: 'Quarter 1', start: '', end: '' },
    { name: 'Quarter 2', start: '', end: '' },
    { name: 'Quarter 3', start: '', end: '' },
    { name: 'Quarter 4', start: '', end: '' },
  ])

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

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogoUpload(grade: number, file: File | undefined) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setGradeLogos(prev => ({ ...prev, [grade]: url }))
  }

  function handleDayClick(key: string) {
    if (calendarData[key]?.type === selectedTool && !selectedLabel) {
      const next = { ...calendarData }
      delete next[key]
      setCalendarData(next)
    } else {
      setCalendarData(prev => ({
        ...prev,
        [key]: { type: selectedTool, label: selectedLabel }
      }))
    }
    setEditingDay(null)
  }

  function clearDay(key: string) {
    const next = { ...calendarData }
    delete next[key]
    setCalendarData(next)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function countDays() {
    const counts: Record<string, number> = {}
    DAY_TYPES.forEach(dt => { counts[dt.key] = 0 })
    Object.values(calendarData).forEach(entry => {
      if (counts[entry.type] !== undefined) counts[entry.type]++
    })
    return counts
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const dayCounts = countDays()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/settings" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#C47A2C' }}>Settings</h1>

          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #d0c4a0' }}>
            {[
              ['branding','School & Branding'],
              ['grading','Grading'],
              ['accounts','User Accounts'],
              ['calendar','School Year Calendar'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as any)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: tab === key ? '2px solid #C47A2C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === key ? '#C47A2C' : '#888' }}>
                {label}
              </button>
            ))}
          </div>

          {/* ─── BRANDING TAB ─── */}
          {tab === 'branding' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-4">School Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>School Name</label>
                    <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>School Motto</label>
                    <input value={motto} onChange={(e) => setMotto(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-1">Brand Colors</h2>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>Applied platform-wide for all users.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Primary Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '40px', height: '32px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer' }} />
                      <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ flex: 1, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: '40px', height: '32px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer' }} />
                      <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ flex: 1, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-1">Per-Grade Logos</h2>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '14px' }}>Students see their grade's logo. Teachers see the logo for their assigned grade level. Admins see the Admin logo.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                  {GRADE_SLOTS.map(slot => (
                    <div key={slot.key} style={{ border: '1px solid #e8e0d0', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ width: '100%', aspectRatio: '1', background: '#f9f6ee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', overflow: 'hidden' }}>
                        {gradeLogos[slot.key] ? (
                          <img src={gradeLogos[slot.key]} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '9px', color: '#bbb' }}>No logo</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '600', color: '#5B2C83', marginBottom: '4px' }}>{slot.label}</div>
                      <label style={{ fontSize: '9px', color: '#C47A2C', cursor: 'pointer', textDecoration: 'underline' }}>
                        Upload
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(slot.key, e.target.files?.[0])} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-1">Font Size</h2>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>This is a personal preference — it only affects your own view, not other users.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {FONT_SIZES.map(size => (
                    <button key={size} onClick={() => setFontSize(size)} style={{
                      padding: '7px 16px', borderRadius: '4px',
                      fontSize: size === 'Small' ? '11px' : size === 'Medium' ? '13px' : size === 'Large' ? '15px' : size === 'XL' ? '17px' : '19px',
                      fontWeight: '600', cursor: 'pointer',
                      border: fontSize === size ? '2px solid #C47A2C' : '1px solid #c8bea0',
                      background: fontSize === size ? '#fdebd0' : 'white',
                      color: fontSize === size ? '#C47A2C' : '#555',
                    }}>{size}</button>
                  ))}
                </div>
              </div>

              <button onClick={save} style={{ padding: '8px 24px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ─── GRADING TAB ─── */}
          {tab === 'grading' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h2 className="font-bold text-purple-900">Grading Scale</h2>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={useCustomScale} onChange={(e) => setUseCustomScale(e.target.checked)} />
                    Use a custom grading scale
                  </label>
                </div>
                {!useCustomScale ? (
                  <div style={{ padding: '12px', background: '#f9f6ee', borderRadius: '6px', border: '1px solid #e8e0d0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>Default 10-Point Scale</div>
                    {[['A','90-100'],['B','80-89'],['C','70-79'],['D','60-69'],['F','0-59']].map(([g,r]) => (
                      <div key={g} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                        <span style={{ fontWeight: '700', minWidth: '20px' }}>{g}</span>
                        <span style={{ color: '#888' }}>{r}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#f9f6ee', borderRadius: '6px', border: '1px solid #e8e0d0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>Custom Scale</div>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input placeholder="Letter" style={{ width: '60px', padding: '6px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                        <input placeholder="Min %" style={{ width: '80px', padding: '6px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                        <input placeholder="Max %" style={{ width: '80px', padding: '6px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                    ))}
                    <button style={{ fontSize: '11px', color: '#C47A2C', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: '4px' }}>+ Add grade level</button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-3">GPA Weighting</h2>
                {[['Standard','4.0 max'],['Honors','5.0 max'],['AP / College Level','6.0 max']].map(([t,s]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', border: '1px solid #e8e0d0', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
                    <span>{t}</span><span style={{ fontWeight: '600', color: '#C47A2C' }}>{s}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-3">Athletics Minimum GPA</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                  <select value={minGPA} onChange={(e) => setMinGPA(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>1.5</option><option>2.0</option><option>2.5</option><option>3.0</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#888' }}>Minimum unweighted GPA required to participate</span>
                </div>
                <div style={{ borderTop: '1px solid #ede8dc', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>Hard Class-Grade Cutoff</div>
                  <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>A student with any class grade at or below this letter is automatically ineligible, regardless of overall GPA.</p>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    {['F','D','C'].map(letter => (
                      <label key={letter} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', padding: '6px 14px', border: cutoffLetter === letter ? '2px solid #C47A2C' : '1px solid #c8bea0', borderRadius: '6px', background: cutoffLetter === letter ? '#fdebd0' : 'white' }}>
                        <input type="radio" name="cutoff" checked={cutoffLetter === letter} onChange={() => setCutoffLetter(letter)} />
                        <span style={{ fontWeight: '700' }}>{letter}</span> or below
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={save} style={{ padding: '8px 24px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ─── ACCOUNTS TAB ─── */}
          {tab === 'accounts' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-3">Session Timeouts</h2>
                {[['Student','4 hours (extended by active video)'],['Parent','2 hours'],['Teacher / TA','1 hour'],['Admin','30 minutes']].map(([r,t]) => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '12px', borderBottom: '1px solid #ede8dc' }}>
                    <span>{r}</span>
                    <select defaultValue={t} style={{ padding: '5px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px' }}>
                      <option>{t}</option>
                      <option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>4 hours</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-3">Two-Factor Authentication</h2>
                {[['Admin','Mandatory'],['Teacher / TA','Mandatory'],['Parent','Optional'],['Student','Optional']].map(([r,req]) => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '12px', borderBottom: '1px solid #ede8dc' }}>
                    <span>{r}</span>
                    <select defaultValue={req} style={{ padding: '5px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px' }}>
                      <option>Mandatory</option><option>Optional</option>
                    </select>
                  </div>
                ))}
              </div>

              <button onClick={save} style={{ padding: '8px 24px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ─── CALENDAR TAB ─── */}
          {tab === 'calendar' && (
            <div className="flex flex-col gap-6">

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 className="font-bold text-purple-900 mb-1">School Year</h2>
                    <p style={{ fontSize: '11px', color: '#888' }}>Mark school days, holidays, half days, events, and professional development days on the calendar below.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#5B2C83' }}>Start Year:</label>
                    <select value={schoolYearStart} onChange={e => setSchoolYearStart(Number(e.target.value))} style={{ padding: '6px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                      {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                        <option key={y} value={y}>{y}–{y+1}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {DAY_TYPES.map(dt => (
                    <div key={dt.key} style={{ padding: '6px 12px', borderRadius: '20px', background: dt.bg, border: `1px solid ${dt.color}30`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: dt.color }}>{dayCounts[dt.key]}</span>
                      <span style={{ fontSize: '10px', color: dt.color, fontWeight: '600' }}>{dt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
                <h2 className="font-bold text-purple-900 mb-3">Term / Quarter Dates</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {termRanges.map((term, i) => (
                    <div key={i} style={{ border: '1px solid #e8e0d0', borderRadius: '6px', padding: '10px' }}>
                      <input
                        value={term.name}
                        onChange={e => {
                          const next = [...termRanges]
                          next[i] = { ...next[i], name: e.target.value }
                          setTermRanges(next)
                        }}
                        style={{ width: '100%', fontSize: '11px', fontWeight: '700', color: '#5B2C83', border: 'none', background: 'transparent', marginBottom: '8px', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>
                          <label style={{ fontSize: '9px', textTransform: 'uppercase', color: '#aaa', display: 'block' }}>Start</label>
                          <input type="date" value={term.start} onChange={e => {
                            const next = [...termRanges]
                            next[i] = { ...next[i], start: e.target.value }
                            setTermRanges(next)
                          }} style={{ width: '100%', padding: '4px 6px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '9px', textTransform: 'uppercase', color: '#aaa', display: 'block' }}>End</label>
                          <input type="date" value={term.end} onChange={e => {
                            const next = [...termRanges]
                            next[i] = { ...next[i], end: e.target.value }
                            setTermRanges(next)
                          }} style={{ width: '100%', padding: '4px 6px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '200px', flexShrink: 0 }}>
                  <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#5B2C83', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day Type</div>
                    {DAY_TYPES.map(dt => (
                      <button key={dt.key} onClick={() => setSelectedTool(dt.key)} style={{
                        width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: '6px', marginBottom: '4px',
                        border: selectedTool === dt.key ? `2px solid ${dt.color}` : '2px solid transparent',
                        background: selectedTool === dt.key ? dt.bg : 'transparent',
                        cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: dt.color,
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dt.color, flexShrink: 0, display: 'inline-block' }} />
                        {dt.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #ede8dc', marginTop: '10px', paddingTop: '10px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>Optional Label</label>
                      <input
                        placeholder="e.g. Christmas Break"
                        value={selectedLabel}
                        onChange={e => setSelectedLabel(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '11px' }}
                      />
                      <p style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>Click days on the calendar to paint them. Click again to clear.</p>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <button onClick={prevMonth} style={{ padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#5B2C83' }}>‹</button>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#5B2C83' }}>
                        {MONTHS[viewMonth]} {viewYear}
                      </div>
                      <button onClick={nextMonth} style={{ padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '14px', color: '#5B2C83' }}>›</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#888', padding: '4px 0' }}>{d}</div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const key = dateKey(viewYear, viewMonth, day)
                        const entry = calendarData[key]
                        const dayType = entry ? DAY_TYPES.find(dt => dt.key === entry.type) : null
                        const isWeekend = new Date(viewYear, viewMonth, day).getDay() === 0 || new Date(viewYear, viewMonth, day).getDay() === 6

                        return (
                          <div
                            key={day}
                            onClick={() => handleDayClick(key)}
                            title={entry?.label || ''}
                            style={{
                              aspectRatio: '1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexDirection: 'column',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px', fontWeight: entry ? '700' : '400',
                              background: dayType ? dayType.bg : isWeekend ? '#f5f3ee' : 'white',
                              color: dayType ? dayType.color : isWeekend ? '#ccc' : '#333',
                              border: dayType ? `1px solid ${dayType.color}50` : '1px solid #ede8dc',
                              position: 'relative',
                              userSelect: 'none',
                            }}
                          >
                            {day}
                            {entry?.label && (
                              <div style={{ position: 'absolute', bottom: '1px', left: 0, right: 0, textAlign: 'center', fontSize: '7px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '0 2px', color: dayType?.color }}>
                                {entry.label}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={save} style={{ padding: '8px 24px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {saved ? 'Saved!' : 'Save Calendar'}
              </button>
            </div>
          )}

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}