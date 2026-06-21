'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DRAFTS = [
  { id: 1, title: 'Field Trip Safety Procedure', type: 'SOP', version: 'V0.3', checkedOutBy: null, status: 'Draft' },
]

export default function TeacherDraftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [drafts, setDrafts] = useState(DRAFTS)
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

  function createDraft() {
    if (!newTitle) return
    setDrafts([{ id: Date.now(), title: newTitle, type: 'SOP', version: 'V0.1', checkedOutBy: null, status: 'Draft' }, ...drafts])
    setNewTitle('')
    setShowNew(false)
  }

  function checkOut(id: number) {
    setDrafts(drafts.map(d => d.id === id ? { ...d, checkedOutBy: user.display_name, status: 'Checked Out' } : d))
  }

  function submitForApproval(id: number) {
    setDrafts(drafts.map(d => d.id === id ? { ...d, status: 'Pending Approval' } : d))
  }

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
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/training/drafts" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Draft Documents</h1>
            <button onClick={() => setShowNew(!showNew)} style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>New Document</button>
          </div>

          {showNew && (
            <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Document title..." style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }} />
              <div className="flex gap-2">
                <button onClick={createDraft} style={{ padding: '7px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Create Draft</button>
                <button onClick={() => setShowNew(false)} style={{ padding: '7px 16px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {drafts.map(d => (
              <div key={d.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83' }}>{d.title}</div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{d.type} · {d.version} · {d.status}</div>
                {d.status === 'Draft' && !d.checkedOutBy && (
                  <button onClick={() => checkOut(d.id)} style={{ fontSize: '11px', padding: '4px 12px', background: '#5B2C83', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Check Out & Edit</button>
                )}
                {d.checkedOutBy === user.display_name && (
                  <button onClick={() => submitForApproval(d.id)} style={{ fontSize: '11px', padding: '4px 12px', background: '#C9A33A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit for Approval</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}
