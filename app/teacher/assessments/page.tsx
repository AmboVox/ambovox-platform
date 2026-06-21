'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

export default function AssessmentBuilderPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [assessType, setAssessType] = useState<'knowledge'|'quiz'|'test'>('quiz')
  const [requireVerification, setRequireVerification] = useState(true)
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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/assessments" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2E6B4A' }}>Assessment Builder</h1>

          <div style={{ display: 'flex', gap: '0', marginBottom: '16px', border: '1px solid #d0c4a0', borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
            {(['knowledge','quiz','test'] as const).map(t => (
              <button key={t} onClick={() => setAssessType(t)} style={{
                padding: '8px 18px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none',
                background: assessType === t ? '#2E6B4A' : 'white',
                color: assessType === t ? 'white' : '#555',
                textTransform: 'capitalize',
              }}>
                {t === 'knowledge' ? 'Knowledge Check' : t}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
            {assessType === 'test' && (
              <div style={{ background: '#fceaea', color: '#7a1020', borderLeft: '3px solid #8C1D2C', padding: '9px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
                Test — one attempt only. Answers hidden until released. Per-question timestamps. Paste detection active on all fields.
              </div>
            )}
            {assessType === 'quiz' && (
              <div style={{ background: '#fff3cd', color: '#7a5c00', borderLeft: '3px solid #C47A2C', padding: '9px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
                Quiz — no retake unless assigned as makeup. Answers released by teacher.
              </div>
            )}
            {assessType === 'knowledge' && (
              <div style={{ background: '#e8f5ee', color: '#1a5c35', borderLeft: '3px solid #2E6B4A', padding: '9px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
                Knowledge Check — always retakeable. Answers always visible. Graded on completion only.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Title</label>
                <input defaultValue="Module 1 Test — Number Systems" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assigned To</label>
                <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                  <option>All students</option>
                  <option>Custom selection...</option>
                </select>
              </div>
            </div>

            <div style={{ border: '1px solid #d0c4a0', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Q1 — Multiple Choice</label>
              <input defaultValue="Which of the following is an irrational number?" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }} />
              {['3/4','√2','0.75','−5'].map((o, i) => (
                <div key={o} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input type="radio" name="correct" defaultChecked={i === 1} />
                  <input defaultValue={o} style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0d8c0', borderRadius: '4px', fontSize: '12px' }} />
                  {i === 1 && <span style={{ fontSize: '10px', color: '#2E6B4A', fontWeight: '600' }}>✓ Correct</span>}
                </div>
              ))}
            </div>

            {assessType === 'test' && (
              <div style={{ border: '1.5px solid #C9A33A', borderRadius: '8px', padding: '14px', marginBottom: '14px', background: '#f9f6ee' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#2E6B4A', marginBottom: '6px' }}>🛡 Verification Question</div>
                <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Linked parent OR Rex Christus teacher enters credentials. Paste blocked. Timestamp logged.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requireVerification} onChange={(e) => setRequireVerification(e.target.checked)} />
                  Require parent/teacher verification before submission
                </label>
              </div>
            )}

            <button style={{ padding: '7px 16px', border: '1px dashed #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white', width: '100%' }}>
              + Add question
            </button>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={{ padding: '8px 20px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Save & Publish</button>
              <button style={{ padding: '8px 20px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Save Draft</button>
            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}