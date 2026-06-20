'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DRAFTS = [
  { id: 1, title: 'Field Trip Safety Procedure', type: 'SOP', version: 'V0.3', author: 'Ms. Hart', checkedOutBy: null, status: 'Draft', updated: 'Jun 12' },
  { id: 2, title: 'Substitute Teacher Checklist', type: 'Work Instruction', version: 'V0.1', author: 'Dr. Osei', checkedOutBy: 'Mr. Patel', status: 'Checked Out', updated: 'Jun 13' },
  { id: 3, title: 'Emergency Lockdown Protocol', type: 'SOP', version: 'V0.2', author: 'Dr. Osei', checkedOutBy: null, status: 'Pending Approval', updated: 'Jun 10' },
]

export default function DraftDocumentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('SOP')
  const [drafts, setDrafts] = useState(DRAFTS)
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

  function createDraft() {
    if (!newTitle) return
    setDrafts([{ id: Date.now(), title: newTitle, type: newType, version: 'V0.1', author: user.display_name, checkedOutBy: null, status: 'Draft', updated: 'Today' }, ...drafts])
    setNewTitle('')
    setShowNew(false)
  }

  function checkOut(id: number) {
    setDrafts(drafts.map(d => d.id === id ? { ...d, checkedOutBy: user.display_name, status: 'Checked Out' } : d))
  }

  function checkIn(id: number) {
    setDrafts(drafts.map(d => d.id === id ? { ...d, checkedOutBy: null, status: 'Draft' } : d))
  }

  function submitForApproval(id: number) {
    setDrafts(drafts.map(d => d.id === id ? { ...d, status: 'Pending Approval' } : d))
  }

  function approve(id: number) {
    setDrafts(drafts.filter(d => d.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const statusColor = (s: string) => s === 'Pending Approval' ? { bg: '#fdebd0', color: '#7a3c00' } : s === 'Checked Out' ? { bg: '#fff3cd', color: '#856404' } : { bg: '#e8e0d0', color: '#555' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/training/drafts" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Draft Documents</h1>
            <button onClick={() => setShowNew(!showNew)} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              New Document
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            SOPs and Work Instructions created by Admin or Teachers. Only one person may edit at a time — check out to lock, check in when finished. Admin approval moves a document to Effective Protocols.
          </p>

          {showNew && (
            <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">New Draft Document</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Title</label>
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Document title..." style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>SOP</option>
                    <option>Work Instruction</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createDraft} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Create Draft (V0.1)</button>
                <button onClick={() => setShowNew(false)} style={{ padding: '7px 16px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {drafts.map(d => {
              const sc = statusColor(d.status)
              return (
                <div key={d.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83', marginBottom: '2px' }}>{d.title}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{d.type} · {d.version} · By {d.author} · Updated {d.updated}</div>
                      {d.checkedOutBy && (
                        <div style={{ fontSize: '11px', color: '#C47A2C', marginTop: '4px', fontWeight: '600' }}>🔒 Checked out by {d.checkedOutBy}</div>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{d.status}</span>
                  </div>
                  <div className="flex gap-2">
                    {d.status === 'Draft' && !d.checkedOutBy && (
                      <button onClick={() => checkOut(d.id)} style={{ fontSize: '11px', padding: '4px 12px', background: '#5B2C83', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Check Out & Edit</button>
                    )}
                    {d.checkedOutBy === user.display_name && (
                      <>
                        <button onClick={() => checkIn(d.id)} style={{ fontSize: '11px', padding: '4px 12px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>Check In</button>
                        <button onClick={() => submitForApproval(d.id)} style={{ fontSize: '11px', padding: '4px 12px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit for Approval</button>
                      </>
                    )}
                    {d.status === 'Pending Approval' && (
                      <button onClick={() => approve(d.id)} style={{ fontSize: '11px', padding: '4px 12px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve → Effective Protocols</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}