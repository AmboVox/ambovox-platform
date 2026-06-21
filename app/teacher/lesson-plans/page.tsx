'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PLANS = [
  { id: 1, title: 'Intro to Real Numbers', template: 'Logic', version: 'V1.0', state: 'Steady State', updated: 'May 20' },
  { id: 2, title: 'Quadratic Equations', template: 'Logic', version: 'V0.2', state: 'Draft', updated: 'Jun 10' },
  { id: 3, title: 'Properties of Operations', template: 'Logic', version: 'V2.0', state: 'Steady State', updated: 'May 5' },
]

export default function LessonPlansPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'steady'|'workflow'>('steady')
  const [showNew, setShowNew] = useState(false)
  const [template, setTemplate] = useState('logic')
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
  const stateColor = (s: string) => s === 'Steady State' ? { bg: '#d4edda', color: '#155724' } : { bg: '#fff3cd', color: '#856404' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/lesson-plans" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Lesson Plans</h1>
            <button onClick={() => setShowNew(!showNew)} style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              New Lesson Plan
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0', marginBottom: '16px', border: '1px solid #d0c4a0', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
            <button onClick={() => setView('steady')} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: view === 'steady' ? '#2E6B4A' : 'white', color: view === 'steady' ? 'white' : '#555' }}>Steady State View</button>
            <button onClick={() => setView('workflow')} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none', background: view === 'workflow' ? '#2E6B4A' : 'white', color: view === 'workflow' ? 'white' : '#555' }}>Workflow View</button>
          </div>

          <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
            {view === 'steady'
              ? 'Showing current effective version and superseded versions only.'
              : 'Showing drafts since the current effective version (e.g. V1.1, V1.2) — earlier pre-approval drafts are hidden.'}
          </p>

          {showNew && (
            <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-1">New Lesson Plan</h2>
              <p style={{ fontSize: '11px', color: '#888', marginBottom: '14px' }}>Template auto-suggested based on your assigned grade level. Other templates remain available.</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                {[['grammar','Grammar'],['logic','Logic'],['rhetoric','Rhetoric'],['free','Free Form']].map(([key, label]) => (
                  <button key={key} onClick={() => setTemplate(key)} style={{
                    padding: '10px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    border: template === key ? '2px solid #2E6B4A' : '1px solid #c8bea0',
                    background: template === key ? '#e8f5ee' : 'white',
                    color: template === key ? '#2E6B4A' : '#555',
                  }}>
                    {label} {key === 'logic' && <span style={{ fontSize: '9px', color: '#C9A33A', marginLeft: '4px' }}>★ suggested</span>}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Title</label>
                <input placeholder="Lesson plan title..." style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div style={{ background: '#e8f0fc', color: '#1a4a8a', borderLeft: '3px solid #275FA8', padding: '9px 12px', borderRadius: '4px', fontSize: '11px', marginBottom: '14px' }}>
                Must tag at least one Scope & Standards standard and link to at least one Course Builder lesson before submission.
              </div>
              <div className="flex gap-2">
                <button style={{ padding: '8px 20px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Create Draft (V0.1)</button>
                <button onClick={() => setShowNew(false)} style={{ padding: '8px 20px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Title','Template','Version','State','Updated',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANS.filter(p => view === 'steady' ? p.state === 'Steady State' : true).map(p => {
                  const c = stateColor(p.state)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{p.title}</td>
                      <td style={{ padding: '8px 14px' }}>{p.template}</td>
                      <td style={{ padding: '8px 14px' }}>{p.version}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: c.bg, color: c.color }}>{p.state}</span>
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{p.updated}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Open</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}