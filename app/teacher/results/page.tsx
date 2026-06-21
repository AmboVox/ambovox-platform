'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const RESULTS = [
  { id: 1, name: 'Jordan Kim', score: '78%', duration: '8m 26s', verification: 'mia.kim (Parent)', flags: '1 paste flag', status: 'bw' },
  { id: 2, name: 'Aaliyah Brooks', score: '95%', duration: '12m 10s', verification: 'anne.brooks (Parent)', flags: 'None', status: 'bs' },
  { id: 3, name: 'Ben Castillo', score: '62%', duration: '6m 02s', verification: 'ms.hart (Teacher)', flags: 'None', status: 'bw' },
  { id: 4, name: 'Devon Ellis', score: '—', duration: '—', verification: 'Not submitted', flags: '—', status: 'bd' },
]

export default function TestResultsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [released, setReleased] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmUser, setConfirmUser] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [confirmError, setConfirmError] = useState('')
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

  async function confirmRelease() {
    if (!confirmUser || !confirmPass) {
      setConfirmError('Please enter both username and password.')
      return
    }
    // In production this would validate against the server.
    // For now, accept any non-empty credentials as a demo confirmation.
    setReleased(true)
    setShowConfirm(false)
    setConfirmUser('')
    setConfirmPass('')
    setConfirmError('')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'
  const sc = (s: string) => s === 'bs' ? { bg: '#d4edda', color: '#155724' } : s === 'bw' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8e0d0', color: '#555' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3', position: 'relative' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/results" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2E6B4A' }}>Test Results — Module 1</h1>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Class Avg', value: '78%' },
              { label: 'Verified', value: '26/28' },
              { label: 'Paste Flags', value: '3' },
              { label: 'Released', value: released ? 'Yes' : 'No' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{c.label}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#2E6B4A' }}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg border mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#d0c4a0' }}>
              <div style={{ fontWeight: '700', color: '#5B2C83' }}>Student Results</div>
              <button onClick={() => setShowConfirm(true)} disabled={released} style={{ padding: '6px 16px', background: '#C9A33A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: released ? 'default' : 'pointer', opacity: released ? 0.6 : 1 }}>
                {released ? 'Released ✓' : 'Release Answers'}
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Student','Score','Duration','Verification','Flags','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#2E6B4A', textTransform: 'uppercase', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESULTS.map(r => {
                  const c = sc(r.status)
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{r.name}</td>
                      <td style={{ padding: '8px 14px' }}>{r.score}</td>
                      <td style={{ padding: '8px 14px' }}>{r.duration}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: '#888' }}>{r.verification}</td>
                      <td style={{ padding: '8px 14px', fontSize: '11px', color: r.flags.includes('paste') ? '#C47A2C' : '#2E6B4A' }}>{r.flags}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: c.bg, color: c.color }}>
                          {r.score === '—' ? 'Missing' : parseInt(r.score) < 70 ? 'Low' : parseInt(r.score) >= 90 ? 'Excellent' : 'Passing'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Audit</button>
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

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(18,18,18,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#5B2C83', marginBottom: '6px' }}>Confirm Answer Release</div>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              Releasing answers makes results visible to all students and parents immediately. Enter your credentials to confirm this action.
            </p>
            {confirmError && (
              <div style={{ background: '#fceaea', color: '#7a1020', fontSize: '11px', borderRadius: '4px', padding: '6px 10px', marginBottom: '10px' }}>{confirmError}</div>
            )}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Username</label>
              <input
                value={confirmUser}
                onChange={(e) => setConfirmUser(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                onPaste={(e) => e.preventDefault()}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={confirmRelease} style={{ flex: 1, padding: '8px', background: '#C9A33A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Confirm & Release</button>
              <button onClick={() => { setShowConfirm(false); setConfirmError('') }} style={{ flex: 1, padding: '8px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}