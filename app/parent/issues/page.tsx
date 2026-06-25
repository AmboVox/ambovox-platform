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

const CATEGORIES = [
  'Technical',
  'Content Concern',
  'Account Access',
  'Billing Question',
  'General Concern',
]

export default function ParentIssuesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [category, setCategory] = useState('Technical')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
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

  const canSubmit = title.trim().length > 0 && description.trim().length > 0

  function handleSubmit() {
    if (!canSubmit) return
    setSubmitted(true)
  }

  function handleReset() {
    setSubmitted(false)
    setTitle('')
    setDescription('')
    setCategory('Technical')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/issues"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>Report an Issue</h1>

          {submitted ? (
            <div className="bg-white rounded-lg border p-10" style={{ borderColor: '#d0c4a0', maxWidth: '600px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1d6a3a', marginBottom: '8px' }}>Report Submitted</div>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.7', marginBottom: '24px' }}>
                Your report has been sent to the administration. You will be contacted if any further information is needed.
              </p>
              <button onClick={handleReset} style={{ padding: '8px 22px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Submit Another Report
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0', maxWidth: '600px' }}>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B2C83', display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '13px', background: 'white' }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B2C83', display: 'block', marginBottom: '6px' }}>
                  Title
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B2C83', display: 'block', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Please describe the issue in as much detail as possible..."
                  rows={6}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '13px', resize: 'vertical', lineHeight: '1.7' }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  padding: '10px 28px',
                  background: canSubmit ? '#1A3A5C' : '#c8bea0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                Submit to Admin
              </button>

            </div>
          )}

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}