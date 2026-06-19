'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const TRAINING_ITEMS = [
  { id: 1, type: 'document', urgency: 'required', title: 'Flipped Classroom Policy Update', assigned: 'All Teachers', deadline: 'May 30, 2026', overdue: true, done: 2, total: 6 },
  { id: 2, type: 'quiz', urgency: 'required', title: 'Assessment Integrity & Parent Verification Protocol', assigned: 'All Teachers', deadline: 'Jun 5, 2026', overdue: false, done: 4, total: 6 },
  { id: 3, type: 'video', urgency: 'important', title: 'New Curriculum Builder Walkthrough', assigned: 'All Teachers', deadline: 'Jun 15, 2026', overdue: false, done: 6, total: 6 },
  { id: 4, type: 'document', urgency: 'informational', title: '2026-2027 Academic Calendar Preview', assigned: 'All Staff', deadline: '', overdue: false, done: 10, total: 28 },
]

const URGENCY_COLORS: Record<string,{bg:string,color:string,label:string}> = {
  required: { bg: '#fceaea', color: '#7a1020', label: 'Required' },
  important: { bg: '#fef9e7', color: '#7a5c00', label: 'Important' },
  informational: { bg: '#e8f0fc', color: '#004085', label: 'Informational' },
}

const TYPE_ICONS: Record<string,string> = { document: '📄', video: '🎥', quiz: '📝', announcement: '📢' }

export default function TrainingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('document')
  const [newUrgency, setNewUrgency] = useState('required')
  const [newAssigned, setNewAssigned] = useState('All Teachers')
  const [newDeadline, setNewDeadline] = useState('')
  const [items, setItems] = useState(TRAINING_ITEMS)
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

  function createItem() {
    if (!newTitle) return
    setItems([...items, { id: Date.now(), type: newType, urgency: newUrgency, title: newTitle, assigned: newAssigned, deadline: newDeadline, overdue: false, done: 0, total: 6 }])
    setNewTitle('')
    setShowCreate(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const overdue = items.filter(t => t.overdue)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/training" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Manage Training & Info</h1>
            <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              New Training Item
            </button>
          </div>

          {overdue.length > 0 && (
            <div style={{ background: '#8C1D2C', color: 'white', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠ {overdue.length} required item{overdue.length > 1 ? 's are' : ' is'} overdue and escalated.
            </div>
          )}

          {showCreate && (
            <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">Create New Training Item</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Title</label>
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Training item title..." style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option value="document">Document / Policy</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Urgency</label>
                  <select value={newUrgency} onChange={(e) => setNewUrgency(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option value="required">Required (with deadline)</option>
                    <option value="important">Important</option>
                    <option value="informational">Informational</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Assign To</label>
                  <select value={newAssigned} onChange={(e) => setNewAssigned(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>All Teachers</option>
                    <option>All Staff</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Deadline</label>
                  <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createItem} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Publish</button>
                <button onClick={() => setShowCreate(false)} style={{ padding: '7px 16px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {items.map(t => {
              const pct = Math.round(t.done / t.total * 100)
              const uc = URGENCY_COLORS[t.urgency]
              return (
                <div key={t.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0', borderLeft: `4px solid ${t.urgency === 'required' ? '#8C1D2C' : t.urgency === 'important' ? '#C47A2C' : '#275FA8'}` }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: '15px' }}>{TYPE_ICONS[t.type]}</span>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83' }}>{t.title}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{t.assigned}{t.deadline ? ' · Due ' + t.deadline : ''}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {t.overdue && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', background: '#8C1D2C', color: 'white' }}>⚠ Overdue</span>}
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', background: uc.bg, color: uc.color }}>{uc.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ fontSize: '11px', color: '#888', minWidth: '90px' }}>{t.done}/{t.total} completed</div>
                    <div style={{ flex: 1, height: '6px', background: '#e8e0d0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: t.overdue ? '#8C1D2C' : pct === 100 ? '#2E6B4A' : '#C47A2C', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#888' }}>{pct}%</span>
                    <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View Detail</button>
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